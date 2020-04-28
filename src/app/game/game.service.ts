import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LiveService } from '../live.service';
import { StorageService } from '../storage.service';
import * as DogUtil from '../util.util';
import { Card, CardAction, CardSpecials } from './card.model';
import * as Decks from './deck/decks.util';
import { FlatGameLogItem, GameLogActions, GameLogItem } from './game-log-item.interface';
import { CardResult, FlatMove, FullMove, MovablePiece, Move, MoveResult, UsableAction, UsableCard } from './interfaces';
import { Piece } from './piece.model';
import { Player } from './player.model';
import { Space } from './space.model';

const HAND_SIZE = 6;
const DEFAULT_CARD_QUANTITY = 8;
const ACTION_DELAY = 3500;
export const NUMBER_OF_PLAYERS = 4;
const RULE_VARIANT_LAND_ON_OWN_PIECE = true;

@Injectable()

export class GameService {

	gameId: number;
	location: string;
	isLoaded = false;

	log: GameLogItem[] = [];

	// storage / access
	cards: Card[];
	pieces: Piece[];
	spaces: Space[]; // includes main board + goal, but not home "spaces"
	boardSpaces: Space[]; // only main board, no goal
	players: Player[];

	// variable game items
	player: Player;
	deck: Card[];
	discard: Card[];

	// State
	round: number;
	turn: number;
	activePlayer: Player;
	hasDiscarded: boolean;

	// utilities
	recursions: number;

	// Events for components
	updates: string[] = []; // stored set of string, dispatched/cleared on update
	update = new Subject<string[]>();
	actionSubject = new Subject<GameLogItem>();
	majorUpdate = new Subject<void>();

	constructor(
		private storage: StorageService,
		private live: LiveService
	) { }

	sendUpdate(updates: string[] = []): void {
		this.update.next([...updates, ...this.updates]);
		this.updates = [];
	}

	deal(): void {
		this.players.forEach((player: Player) => {
			player.hand = [];
			for (let i = 0; i < this.getHandSizeForRound() && this.deck.length > 0; i++) {
				player.hand.push(this.drawCard());
			}
		});
	}

	drawCard(): Card {
		if (this.deck.length === 0) {
			this.deck = this.discard;
			this.discard = [];
			DogUtil.shuffle(this.deck);
		}
		return this.deck.shift();
	}

	shuffleDiscardIntoDeck(): void {
		this.deck = DogUtil.shuffle([...this.deck, ...this.discard]);
		this.discard = [];
		this.sendAction({
			action: GameLogActions.SHUFFLE,
			cards: this.deck
		});
	}

	advanceRound(): void {
		const shuffle = this.deck.length < this.getHandSizeForRound() * this.players.length;
		if (shuffle) {
			this.deck = [...this.deck, ...this.discard];
		}

		if (this.location === 'local') {
			this.executeAdvanceRound();
		} else {
			this.sendAction({
				action: GameLogActions.ADVANCE_ROUND,
				cards: shuffle ? this.deck : undefined
			});
		}
	}

	executeAdvanceRound(): void {
		this.round++;
		this.hasDiscarded = false;
		this.turn = 1; // 0 for swapping in the future
		this.deal();
		this.save();
		this.sendUpdate(['advanceTurn', 'advanceRound']);
	}

	advanceTurn(): void {
		this.turn++;
		this.setActivePlayer();
		if (this.activePlayer.hand.length === 0) {
			if (this.player.host) {
				this.advanceRound();
			}
			return;
		}
		this.hasDiscarded = false;
		this.save();
		this.sendUpdate(['advanceTurn']);
		if (this.activePlayer.onlineStatus === 'bot') {
			this.takeTurnForPlayer(this.activePlayer);
		}
	}

	getUsableCards(player): UsableCard[] {
		return player.hand.reduce((usableCards: UsableCard[], card: Card) => {
			const usableActions = card.actions.reduce((actions: UsableAction[], action: CardAction) => {
				const { movablePieces: thesePieces } = this.getMovablePiecesForAction(player, action);
				if (thesePieces.length) {
					actions.push({
						action,
						movablePieces: thesePieces
					});
				}
				return actions;
			}, []);
			if (usableActions.length) {
				usableCards.push({
					card,
					usableActions
				});
			}
			return usableCards;
		}, []);
	}

	delayUI(delayed: () => void): void {
		setTimeout(() => {
			delayed();
		}, ACTION_DELAY);
	}

	takeTurnForPlayer(player: Player): void {
		if (!this.player.host) {
			return;
		}

		// console.log('Taking turn for ', player.name);

		// Get eligible moves
		const usableCards = this.getUsableCards(player);

		// check for discard
		if (!usableCards.length) {
			this.delayUI(() => {
				// select least useful card
				// TODO
				this.discardCard(player, player.hand[0]);
				if (this.hasDiscarded) {
					this.takeTurnForPlayer(player);
				}
			});
			return;
		}

		// prioritize moves
		const cardToPlay = usableCards[0].card;
		const actionToUse = usableCards[0].usableActions[0];
		const pieceToMove = actionToUse.movablePieces[0].piece;
		const spaceToMoveTo = actionToUse.movablePieces[0].spaces.slice(-1)[0]; // use the max number of spaces

		// needs some more Burning Seven logic to add more moves

		this.delayUI(() => {
			const moves = [{
				piece: pieceToMove,
				space: spaceToMoveTo
			}];
			const action = cardToPlay.actions[0];
			this.playCard(player, cardToPlay, action, moves);
		});
	}

	setActivePlayer(): void {
		this.activePlayer = this.players[(this.turn - 1) % this.players.length];
	}

	loadGame(id: number, location: string, localPlayerId: number): void {
		this.location = location;
		this.gameId = id;
		this.isLoaded = false;

		if (this.location === 'remote') {
			this.live.openConnection(this.gameId);
			this.live.incomingMessage.subscribe(this.handleMessage.bind(this));
		}

		this.storage.loadGame(id, location).subscribe((loadedGame) => {

			if (loadedGame === false) {
				this.newGame();
			} else {
				Object.assign(this, loadedGame);
				this.buildBoardSpaces();
			}

			this.player = this.players[localPlayerId];
			this.player.onlineStatus = 'you';
			this.players.forEach(player => {
				if (player !== this.player && player.onlineStatus === 'you') {
					player.onlineStatus = this.location === 'local' ? 'bot' : 'offline';
				}
			});
			this.setActivePlayer();
			this.save();
			this.majorUpdate.next();
			this.sendUpdate(['gameLoaded']);

			if (this.location === 'remote') {
				this.sendAction({
					action: GameLogActions.JOIN,
					player: this.player
				});
			}

			if (this.activePlayer.onlineStatus === 'bot') {
				this.takeTurnForPlayer(this.activePlayer);
			}

			this.isLoaded = true;
		});
	}

	newGame(): void {
		this.discard = [];
		this.hasDiscarded = false;
		this.round = 1;
		this.turn = 1;

		this.buildPlayers();
		this.player = this.players[0];
		this.player.onlineStatus = 'you';
		this.player.host = true;
		this.buildBoardSpaces();

		this.pieces = [];
		this.spaces = [];
		this.players.forEach(({ pieces, spaces, goal}) => {
			this.pieces = [...this.pieces, ...pieces];
			this.spaces = [...this.spaces, ...spaces, ...goal];
		}, []);

		this.buildDeck();
		this.cards = [...this.deck];
		this.deck = DogUtil.shuffle(this.deck);
		this.deal();
	}

	save(): void {
		if (this.player.host) {
			this.storage.saveGame(this, this.gameId);
		}
	}

	getHandSizeForRound(): number {
		return HAND_SIZE - ((this.round - 1) % 5);
	}

	checkMovablePieces(movablePieces, burningRemaining): boolean {
		return movablePieces.some(({ piece, spaces }) => {
			return spaces.some(space => {
				return this.getDistanceBetweenSpaces(piece.space, space) === burningRemaining;
			});
		});
	}

	public getMovablePiecesForAction(player: Player, action: CardAction, burningRemaining?: number): CardResult {
		const errorMessage = '';

		const movablePieces: MovablePiece[] = [];
		let movementOptions: number[] = [];

		if (action.startable) {
			if (player.home.length && !(player.spaces[0].piece && player.spaces[0].piece.player === player)) {
				movablePieces.push({
					piece: player.home[0],
					spaces: [player.spaces[0]]
				});
			}
		}

		if (action.special === CardSpecials.BURNING) {
			burningRemaining = burningRemaining || action.value;
			movementOptions = new Array(burningRemaining).fill(0).map((value, index) => index + 1);
		} else if (action.values) {
			movementOptions = action.values;
		} else if (action.value) {
			movementOptions = [action.value];
		}

		const boardPieces = player.pieces.filter((piece: Piece) => !!piece.space);

		if (boardPieces.length !== 0) {

			this.recursions = 0;
			const value = burningRemaining || action.value;
			movablePieces.push(...this.getAndCheckMovablePiecesRecursive(player, boardPieces, action, movementOptions, value));
			// console.log(this.recursions);

			// Add in swap options
			if (action.special === CardSpecials.SWAP) {
				const destinationPieces = this.pieces.filter(piece => {
					const isOtherPiece = piece.player !== player;
					const onBoard = piece.space && !piece.space.isGoal && !piece.space.isStart;
					return isOtherPiece && onBoard;
				});

				const startPieces = player.pieces.filter(piece => {
					return piece.space && !piece.space.isGoal && !piece.space.isStart;
				});

				if (destinationPieces.length) {
					movablePieces.push(...startPieces.map(piece => {
						return {
							piece,
							spaces: destinationPieces.map(destinationPiece => destinationPiece.space)
						};
					}));
				}
			}

			// There is a possibility of dupes when using jokers for swap vs movement
		}

		return {
			errorMessage,
			movablePieces
		};
	}

	getAndCheckMovablePiecesRecursive(
		player: Player,
		consideredPieces: Piece[],
		action: CardAction,
		movementOptions: number[],
		moveValue: number
	) {
		// Get spaces that can be moved to
		this.recursions++;
		if (movementOptions.length && consideredPieces.length) {
			const movablePieces = this.getMovablePiecesForMovementOptions(consideredPieces, movementOptions);
			if (action.special !== CardSpecials.BURNING) {
				return movablePieces;
			} else {
				// here we go
				const result = this.checkMovablePieces(movablePieces, moveValue);

				if (result) {
					return movablePieces;
				} else {
					return movablePieces.reduce((resultPieces, movablePiece) => {
						const { piece, spaces } = movablePiece;

						const filteredSpaces = spaces.filter(space => {
							// Make a mock move and see what happens
							const spacesMoved = this.getDistanceBetweenSpaces(piece.space, space);
							const { fullMoves } = this.createFullMoves(player, action, {
								piece,
								space
							});
							fullMoves.forEach(this.performMove.bind(this));
							const filteredPieces = consideredPieces.filter(thisPiece => thisPiece !== piece);
							const newMovementOptions = new Array(moveValue - spacesMoved).fill(0).map(({}, index) => index + 1);
							const value = moveValue - spacesMoved;
							const recurseMovablePieces = this.getAndCheckMovablePiecesRecursive(player, filteredPieces, action, newMovementOptions, value);
							// Reset local state
							fullMoves.forEach(this.undoMove.bind(this));
							// check if there are options
							if (recurseMovablePieces.length) {
								return true;
							}
						});

						if (filteredSpaces.length) {
							return [...resultPieces, {
								piece,
								spaces: filteredSpaces
							}];
						} else {
							return resultPieces;
						}
					}, []);
				}
			}
		}
		return [];
	}

	getMovablePiecesForMovementOptions(pieces: Piece[], movementOptions: number[]): MovablePiece[] {
		const { player } = pieces[0];

		return pieces.map((piece: Piece) => {
			return {
				piece,
				spacePossibilities: this.getSpacePossibilitesForPiece(piece),
			};
		}).reduce((result, { piece, spacePossibilities }): MovablePiece[] => {
			if (!Object.values(spacePossibilities).length) {
				return result;
			} else {
				const spaces: Space[] = [];
				movementOptions.forEach((numberOfSpaces: number) => {
					const spacesUnderConsideration: Space[] = spacePossibilities[numberOfSpaces];
					if (spacesUnderConsideration) {
						spacesUnderConsideration.forEach(space => {
							if (space.piece && space.piece.player === player && !RULE_VARIANT_LAND_ON_OWN_PIECE) {
								// if landing on own piece, and rules disallow that
								return;
							} else if (space.piece && space.isStart && space.player === space.piece.player) {
								// if landing on a piece on its owners home space
								return;
							} else {
								spaces.push(space);
							}
						});
					}
				});
				if (!spaces.length) {
					return result;
				} else {
					return [...result, {
						piece,
						spaces
					}];
				}
			}
		}, []);
	}

	public getSpacePossibilitesForPiece(piece: Piece, min: number = -4, max: number = 13): Record<number, Space[]> {
		if (!piece.space) {
			return {};
		}
		if (piece.space.isGoal) {
			const goalIndex = piece.player.goal.findIndex(space => space === piece.space);
			let hitPiece = false;
			return piece.player.goal.slice(goalIndex + 1).reduce((spacePossibilities: Record<number, Space[]>, space, index) => {
				if (space.piece) {
					hitPiece = true;
				} else if (!hitPiece) {
					spacePossibilities[index + 1] = [ space ];
				}
				return spacePossibilities;
			}, {});
		} else {
			const spacePossibilities = {};
			const currentIndex = this.boardSpaces.findIndex(thisSpace => thisSpace === piece.space);
			let index = currentIndex;
			let moves = Math.max(1, min);

			// Loop around the board, adding spaces
			while (moves <= max) {
				index++;
				// loop around
				if (index >= this.boardSpaces.length) {
					index = 0;
				}
				const space = this.boardSpaces[index];
				// break if encountering a piece on its home space
				if (space.isStart && space.piece && space.player === space.piece.player) {
					break;
				}
				spacePossibilities[moves] = [this.boardSpaces[index]];
				moves++;
			}

			// find goal spaces within reach
			// currently this disallows moving into home "over" your piece on your home space
			let startMove;
			let hitPiece = false;
			Object.entries(spacePossibilities).forEach(([movesString, spaces]: [string, Space[]]) => {
				const numberMoves = Number(movesString);
				if (spaces[0].isStart && spaces[0].player === piece.player) {
					startMove = numberMoves;
				}
				if (startMove && numberMoves > startMove && !hitPiece) {
					const goalIndex = numberMoves - startMove - 1;
					if (piece.player.goal[goalIndex]) {
						if (piece.player.goal[goalIndex].piece) {
							hitPiece = true;
						} else {
							spaces.push(piece.player.goal[goalIndex]);
						}
					}
				}
			});

			// Add spaces for negative movement
			if (min < 0) {
				moves = -1;
				index = currentIndex;
				while (moves >= min) {
					index--;
					if (index < 0) {
						index = this.boardSpaces.length - 1;
					}
					spacePossibilities[moves] = [this.boardSpaces[index]];
					moves--;
				}
			}

			return spacePossibilities;
		}
	}

	public playCard(player: Player, card: Card, action: CardAction, moveSet: Move[]): void {
		if (this.location === 'local') {
			this.attemptPlayCard(player, card, action, moveSet);
		} else {
			this.sendAction({
				action: GameLogActions.PLAY,
				player,
				card,
				moveSet
			});
		}
	}

	attemptPlayCard(player: Player, card: Card, action: CardAction, moveSet: Move[]): boolean {

		const errorMessage = this.executeAction(player, action, moveSet);

		if (errorMessage) {
			alert(errorMessage);
			return false;
		}

		this.logAction({
			player,
			card,
			action: GameLogActions.PLAY
		});

		player.hand = player.hand.filter((thisCard: Card) => thisCard !== card);
		this.discard.push(card);
		this.advanceTurn();
		return true;
	}

	executeAction(player: Player, action: CardAction, moveSet: Move[]): string {

		if (action.special !== CardSpecials.BURNING) {
			// Validate player/card/piece/space combo is valid
			const { piece, space } = moveSet[0];
			const { movablePieces } = this.getMovablePiecesForAction(player, action);
			const foundPiece = movablePieces.find((movablePiece: MovablePiece) => {
				return movablePiece.piece === piece;
			});

			if (!foundPiece) {
				return 'This piece is not eligible to be moved';
			} else if (!foundPiece.spaces.includes(space)) {
				return 'This piece cannot be moved to this space';
			}
		} else {
			// todo: validate burning seven move
			// can possibly just validate as we loop, undo if there's an issue
		}

		const completedMoves = [];
		let error = '';

		moveSet.forEach(move => {
			const result = this.createFullMoves(player, action, move);
			if (result.errorMessage) {
				error = result.errorMessage;
			} else {
				result.fullMoves.forEach(this.performMove.bind(this));
				completedMoves.push(...result.fullMoves);
			}
		});

		if (error) {
			completedMoves.reverse().forEach(this.undoMove.bind(this));
		}

		return error;
	}

	createFullMoves(player: Player, action: CardAction, move: Move): MoveResult {
		const fullMoves: FullMove[] = [];
		const { space, piece } = move;
		let errorMessage = '';

		if (action.startable && !piece.space) {
			if (player.home.length > 0) {
				const startSpace = player.spaces[0];

				if (startSpace.piece) {
					// kick the other piece out
					fullMoves.push({
						piece: startSpace.piece,
						startSpace,
						endSpace: null
					});
				}
				fullMoves.push({
					piece,
					endSpace: space
				});
			} else {
				errorMessage = 'No pieces left in home!';
			}
		} else {
			const oldSpace = piece.space;

			fullMoves.push({
				piece,
				startSpace: oldSpace,
				endSpace: space
			});

			// Send all passed pieces home
			if (action.special === CardSpecials.BURNING) {
				let spaceIterator = piece.space;
				while (spaceIterator !== space) {
					// stop if we're on own home and headed into goal
					if (space.isGoal && spaceIterator.isStart && piece.player === spaceIterator.player) {
						break;
					}
					let boardIndex = this.boardSpaces.findIndex(boardSpace => boardSpace === spaceIterator);
					if (boardIndex === this.boardSpaces.length - 1) {
						boardIndex = -1;
					}
					spaceIterator = this.boardSpaces[boardIndex + 1];
					if (spaceIterator.piece) {
						fullMoves.push({
							piece: spaceIterator.piece,
							startSpace: spaceIterator
						});
					}
				}
			} else { // only send landed on piece home
				if (space.piece) {
					fullMoves.push({
						piece: space.piece,
						startSpace: space,
						endSpace: action.special === CardSpecials.SWAP ? oldSpace : null
					});
				}
			}
		}

		return {
			fullMoves,
			errorMessage
		};
	}

	performMove({ piece, startSpace, endSpace }: FullMove): void {
		this.executeMove(piece, startSpace, endSpace);
	}

	undoMove({ piece, startSpace, endSpace }: FullMove): void {
		this.executeMove(piece, endSpace, startSpace);
	}

	private executeMove(piece, startSpace, endSpace): void {
		if (!endSpace) {
			piece.player.home.push(piece);
			piece.space = null;
			this.updates.push('home');
		} else {
			piece.space = endSpace;
			endSpace.piece = piece;
		}
		if (!startSpace) {
			piece.player.home = piece.player.home.filter(homePiece => homePiece !== piece);
			this.updates.push('home');
		} else if (startSpace.piece === piece) {
			// another move could have swapped a piece here, so check to see that we're only removing our own piece
			startSpace.piece = null;
		}
	}


	public discardCard(player: Player, card: Card, forceDiscard = false): void {
		if (this.location === 'local') {
			this.executeDiscardCard(player, card, forceDiscard);
		} else {
			this.sendAction({
				action: this.hasDiscarded ? GameLogActions.DISCARD : GameLogActions.DISCARD_DRAW,
				player,
				card
			});
		}
	}

	executeDiscardCard(player: Player, card: Card, forceDiscard = false): void {
		player.hand = player.hand.filter((thisCard: Card) => thisCard !== card);

		this.discard.push(card);
		if (this.hasDiscarded || forceDiscard) {
			this.logAction({
				player,
				card,
				action: GameLogActions.DISCARD
			});
			this.advanceTurn();
		} else {
			this.hasDiscarded = true;
			player.hand.push(this.drawCard());
			this.logAction({
				player,
				card,
				action: GameLogActions.DISCARD_DRAW
			});

			if (this.deck.length === 0 && this.player.host) {
				this.shuffleDiscardIntoDeck();
				if (this.location === 'remote') {
					this.sendAction({
						action: GameLogActions.SHUFFLE,
						cards: this.deck
					});
				}
			}

			this.save();
			this.sendUpdate();
		}
	}

	buildPlayers(numberOfPlayers: number = 4): void {
		this.players = [];
		const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];
		const names = ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple'];
		for (let i = 0; i < numberOfPlayers; i++) {
			this.players.push(new Player({
				color: colors[i],
				id: i,
				name: names[i]
			}));
		}
	}

	buildDeck(): void {
		// Todo: Build in deck-choosing functionality
		const cards = Decks.STANDARD_DECK;
		// const cards = Decks.ALL_SEVENS;

		let id = 0;

		this.deck = cards.reduce((deck, card) => {
			deck = [...deck, ...Array(card.quantity || DEFAULT_CARD_QUANTITY).fill({}).map(() => {
				return new Card({
					...card,
					id: id++
				});
			})];
			return deck;
		}, []);
	}

	buildBoardSpaces(): void {
		this.boardSpaces = [];
		this.players.forEach((player: Player) => {
			this.boardSpaces.push(...player.spaces);
		});
	}

	getDistanceBetweenSpaces(startSpace: Space, endSpace: Space): number {
		let startIndex = this.boardSpaces.findIndex(space => space === startSpace);
		let endIndex = this.boardSpaces.findIndex(space => space === endSpace);
		if (endSpace.isGoal) {
			const endGoalIndex = endSpace.player.goal.findIndex(space => space === endSpace);
			if (startSpace.isGoal) {
				startIndex = startSpace.player.goal.findIndex(space => space === startSpace);
				endIndex = endGoalIndex;
			} else {
				endIndex = this.boardSpaces.findIndex(space => space === endSpace.player.spaces[0]) + endGoalIndex + 1;
			}
		}
		return startIndex < endIndex ? (endIndex - startIndex) : (endIndex - startIndex + 64);
	}

	sendAction(item: GameLogItem): void {
		this.storage.sendLogItem(item, this.gameId);
	}

	logAction(item: GameLogItem): void {
		this.log.push(item);
		this.actionSubject.next(item);
	}

	handleMessage(flatItem: FlatGameLogItem): void {
		if (!this.isLoaded) {
			console.error('Message arrived before game was loaded', flatItem);
			return;
		}
		const { PLAY, DISCARD, DISCARD_DRAW, JOIN, SHUFFLE, ADVANCE_ROUND } = GameLogActions;
		const item = this.hydrateGameLogItem(flatItem);

		// console.log('Handle Message', item.action, item.player && item.player.name, item);

		if (item.action === PLAY) {
			this.attemptPlayCard(item.player, item.card, item.cardAction, item.moveSet);
		} else if (item.action === DISCARD || item.action === DISCARD_DRAW) {
			this.executeDiscardCard(item.player, item.card);
			if (this.hasDiscarded && item.player.onlineStatus === 'bot') {
				this.takeTurnForPlayer(item.player);
			}
		} else if (item.action === JOIN) {
			item.player.onlineStatus = 'online';
			this.save();
		} else if (item.action === SHUFFLE) {
			this.deck = item.cards;
			this.discard = [];
			this.sendUpdate(['deck', 'discard']);
		} else if (item.action === ADVANCE_ROUND) {
			if (item.cards) {
				this.deck = item.cards;
				this.discard = [];
				this.updates.push('deck', 'discard');
			}
			this.executeAdvanceRound();
		}
	}

	hydrateGameLogItem(flatItem: FlatGameLogItem): GameLogItem {
		const item: GameLogItem = {
			action: flatItem.action
		};

		if (flatItem.cardId !== undefined) {
			item.card = this.cards.find(card => card.id === flatItem.cardId);
		}

		if (flatItem.playerId !== undefined) {
			item.player = this.players.find(player => player.id === flatItem.playerId);
		}

		if (flatItem.moveSet !== undefined) {
			item.moveSet = flatItem.moveSet.map(({ pieceId, spaceId }: FlatMove) => {
				return {
					piece: this.pieces.find(piece => piece.id === pieceId),
					space: this.spaces.find(space => space.id === spaceId)
				};
			});
		}

		if (flatItem.cardIds !== undefined) {
			item.cards = flatItem.cardIds.map(cardId => this.cards[cardId]);
		}

		return item;
	}

}
