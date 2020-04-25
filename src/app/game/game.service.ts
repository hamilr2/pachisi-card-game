import { Card, CardSpecials } from './card.model';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Space } from './space.model';
import { Player } from './player.model';
import { Piece } from './piece.model';
import { CardResult, MovablePiece, UsableCard } from './interfaces';
import { Subject } from 'rxjs';
import { LiveService } from '../live.service';
import { GameLogItem, GameLogActions, FlatGameLogItem } from './game-log-item.interface';
import * as DogUtil from '../util.util';

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
			const { movablePieces } = this.getMovablePiecesForCard(player, card);
			if (movablePieces.length) {
				usableCards.push({
					card,
					movablePieces
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
		const pieceToMove = usableCards[0].movablePieces[0].piece;
		// if it's a seven or joker, move max spaces
		const spaceToMoveTo = usableCards[0].movablePieces[0].spaces.slice(-1)[0];
		this.delayUI(() => {
			this.playCard(player, cardToPlay, pieceToMove, spaceToMoveTo);
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

	public getMovablePiecesForCard(player: Player, card: Card): CardResult {
		const errorMessage = '';

		const movablePieces: MovablePiece[] = [];
		let movementOptions: number[] = [];

		if (card.startable) {
			if (player.home.length && !(player.spaces[0].piece && player.spaces[0].piece.player === player)) {
				movablePieces.push({
					piece: player.home[0],
					spaces: [player.spaces[0]]
				});
			}
		}
		if (card.values) {
			movementOptions = card.values;
		} else if (card.basic) {
			movementOptions = [card.value];
		}

		const boardPieces = player.pieces.filter((piece: Piece) => !!piece.space);
		if (boardPieces.length !== 0) {

			// Get spaces that can be moved to
			if (movementOptions.length) {
				movablePieces.push(...boardPieces.map((piece: Piece) => {
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
				}, []));
			}

			// Add in swap options
			if (card.special === CardSpecials.SWAP || card.special === CardSpecials.JOKER) {
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

	public getSpacePossibilitesForPiece(piece: Piece): Record<number, Space[]> {
		const MAX_CARD_VALUE = 13;
		const MIN_CARD_VALUE = -4;
		if (!piece.space) {
			return {};
		}
		if (piece.space.isGoal) {
			const goalIndex = piece.player.goal.findIndex(space => space === piece.space);
			return piece.player.goal.slice(goalIndex + 1).reduce((spacePossibilities: Record<number, Space[]>, space, index) => {
				if (!space.piece) {
					spacePossibilities[index + 1] = [ space ];
				}
				return spacePossibilities;
			}, {});
		} else {
			const spacePossibilities = {};
			const currentIndex = this.boardSpaces.findIndex(thisSpace => thisSpace === piece.space);
			let index = currentIndex;
			let moves = 1;

			// Loop around the board, adding spaces
			while (moves <= MAX_CARD_VALUE) {
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
			Object.entries(spacePossibilities).forEach(([movesString, spaces]: [string, Space[]]) => {
				const numberMoves = Number(movesString);
				if (spaces[0].isStart && spaces[0].player === piece.player) {
					startMove = numberMoves;
				}
				if (startMove && numberMoves > startMove) {
					const goalIndex = numberMoves - startMove - 1;
					if (piece.player.goal[goalIndex] && !piece.player.goal[goalIndex].piece) {
						spaces.push(piece.player.goal[goalIndex]);
					}
				}
			});

			// Add spaces for negative movement
			moves = -1;
			index = currentIndex;
			while (moves >= MIN_CARD_VALUE) {
				index--;
				if (index < 0) {
					index = this.boardSpaces.length - 1;
				}
				spacePossibilities[moves] = [this.boardSpaces[index]];
				moves--;
			}

			return spacePossibilities;
		}
	}

	public playCard(player: Player, card: Card, piece?: Piece, space?: Space): void {
		if (this.location === 'local') {
			this.attemptPlayCard(player, card, piece, space);
		} else {
			this.sendAction({
				action: GameLogActions.PLAY,
				player,
				card,
				piece,
				space
			});
		}
	}

	attemptPlayCard(player: Player, card: Card, piece: Piece, space: Space): boolean {

		const errorMessage = this.executePlayCard(player, card, piece, space);

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

	executePlayCard(player: Player, card: Card, piece: Piece, space: Space): string {
		let errorMessage = '';

		// Validate player/card/piece/space combo is valid
		const { movablePieces } = this.getMovablePiecesForCard(player, card);
		const foundPiece = movablePieces.find((movablePiece: MovablePiece) => {
			return movablePiece.piece === piece;
		});

		if (!foundPiece) {
			return 'This piece is not eligible to be moved';
		} else if (!foundPiece.spaces.includes(space)) {
			return 'This piece cannot be moved to this space';
		}

		if (card.startable && !piece.space) {
			if (player.home.length > 0) {
				const startSpace = player.spaces[0];

				if (startSpace.piece) {
					startSpace.piece.player.home.push(startSpace.piece);
					startSpace.piece.space = null;
				}

				player.spaces[0].piece = player.home.shift();
				player.spaces[0].piece.space = player.spaces[0];
				this.updates.push('home');
			} else {
				errorMessage = 'No pieces left in home!';
			}
		} else {
			const oldSpace = piece.space;

			if (space.piece) {
				const otherPiece = space.piece;

				if (card.special === CardSpecials.SWAP) {
					oldSpace.piece = otherPiece;
					otherPiece.space = oldSpace;
					console.log('SWAP!!!', otherPiece, piece)
				} else {
					otherPiece.space = null;
					otherPiece.player.home.push(otherPiece);
					console.log('Send Home!!!', otherPiece, piece);
				}
			}

			piece.space = space;
			space.piece = piece;
			oldSpace.piece = null;
		}

		return errorMessage;
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
		const cards = [
			{
				symbol: '?',
				quantity: 6,
				startable: true,
				special: CardSpecials.JOKER,
				values: [-4, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
			},
			{
				symbol: 'S',
				special: CardSpecials.SWAP
			},
			{
				symbol: '1/11',
				startable: true,
				values: [1, 11]
			},
			{ value: 2 },
			{ value: 3 },
			{
				symbol: '±4',
				values: [-4, 4]
			},
			{ value: 5 },
			{ value: 6 },
			{
				symbol: '7',
				special: CardSpecials.BURNING,
				values: [1, 2, 3, 4, 5, 6, 7]
			},
			{ value: 8 },
			{ value: 9 },
			{ value: 10 },
			{ value: 12 },
			{
				symbol: '13',
				startable: true,
				values: [13]
			}
		];

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
			this.attemptPlayCard(item.player, item.card, item.piece, item.space);
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

		if (flatItem.pieceId !== undefined) {
			item.piece = this.pieces.find(piece => piece.id === flatItem.pieceId);
		}

		if (flatItem.spaceId !== undefined) {
			item.space = this.spaces.find(space => space.id === flatItem.spaceId);
		}

		if (flatItem.cardIds !== undefined) {
			item.cards = flatItem.cardIds.map(cardId => this.cards[cardId]);
		}

		return item;
	}

}
