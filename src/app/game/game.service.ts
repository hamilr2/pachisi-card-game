import { Card } from './card.model';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { Space } from './space.model';
import { Player } from './player.model';
import { Piece } from './piece.model';
import { CardResult, MovablePiece } from './interfaces';
import { Subject } from 'rxjs';
import { LiveService } from '../live.service';

const shuffle = (items: Array<any>) => {
	return items.map(item => {
		return {
			value: item,
			rand: Math.random()
		};
	}).sort(({rand: randA}, { rand: randB}) => {
		return randA - randB;
	}).map(({value}) => value );
};

export interface GameLogItem {
	player?: Player;
	action: string;
	card?: Card;
	piece?: Piece;
	space?: Space;
	cards?: Card[];
}

export interface FlatGameLogItem {
	playerId?: number;
	action: string;
	cardId?: number;
	pieceId?: number;
	spaceId?: number;
	cardIds?: number[];
}

const HAND_SIZE = 6;
const DEFAULT_CARD_QUANTITY = 8;
const ACTION_DELAY = 1000;
export const NUMBER_OF_PLAYERS = 4;

@Injectable()

export class GameService {

	gameId: number;
	location: string;

	log: GameLogItem[] = [];

	// storage / access
	cards: Card[];
	pieces: Piece[];
	spaces: Space[]; // includes main board + goal, but not home "spaces"
	players: Player[];

	// game items
	boardSpaces: Space[]; // only non-goal spaces!!
	player: Player;
	deck: Card[];
	discard: Card[];

	// State
	round: number;
	turn: number;
	activePlayer: Player;
	hasDiscarded: boolean;

	// Events for components
	updates: string[] = [];
	update = new Subject<string[]>();
	majorUpdate = new Subject<void>();

	sendUpdate(updates: string[] = []) {
		this.update.next([...updates, ...this.updates]);
		this.updates = [];
	}

	deal() {
		this.players.forEach((player: Player) => {
			player.hand = [];
			for (let i = 0; i < this.getHandSizeForRound() && this.deck.length > 0; i++) {
				player.hand.push(this.drawCard());
			}
		});
	}

	drawCard() {
		if (this.deck.length === 0) {
			this.deck = this.discard;
			this.discard = [];
			shuffle(this.deck);
		}
		return this.deck.shift();
	}

	public advanceRound() {
		this.round++;
		this.hasDiscarded = false;
		this.turn = 1; // 0 for swapping in the future
		this.deal();
		this.save();
		this.sendUpdate(['advanceTurn', 'advanceRound']);
	}

	advanceTurn() {
		// TODO: Fix static reference to this.player
		this.turn++;
		this.setActivePlayer();
		if (this.activePlayer.hand.length === 0) {
			this.advanceRound();
			return;
		}
		this.hasDiscarded = false;
		this.save();
		this.sendUpdate(['advanceTurn']);
		if (this.activePlayer.onlineStatus === 'bot') {
			this.takeTurnForPlayer(this.activePlayer);
		}
	}

	getUsableCards(player) {
		return player.hand.reduce((cards: any[], card: Card) => {
			const { movablePieces } = this.getMovablePiecesForCard(player, card);
			if (movablePieces.length) {
				cards.push({
					card,
					movablePieces
				});
			}
			return cards;
		}, []);
	}

	delayUI(delayed: () => void) {
		setTimeout(() => {
			delayed();
		}, ACTION_DELAY);
	}

	takeTurnForPlayer(player: Player) {
		if (!this.player.host) {
			return;
		}
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

	setActivePlayer() {
		this.activePlayer = this.players[(this.turn - 1) % this.players.length];
	}

	constructor(
		private storage: StorageService,
		private live: LiveService
	) { }

	loadGame(id: number, location: string, localPlayerId: number) {
		this.location = location;
		this.gameId = id;

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
					action: 'join',
					player: this.player
				});
			}

			if (this.activePlayer.onlineStatus === 'bot') {
				this.takeTurnForPlayer(this.activePlayer);
			}
		});
	}

	newGame() {
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
		this.deck = shuffle(this.deck);
		this.deal();
	}

	save() {
		if (this.location === 'local' || this.player.host) {
			this.storage.saveGame(this, this.gameId);
		}
	}

	getHandSizeForRound() {
		return HAND_SIZE - ((this.round - 1) % 5);
	}

	public getMovablePiecesForCard(player: Player, card: Card): CardResult {
		const errorMessage = '';

		const movablePieces: MovablePiece[] = [];
		let movementOptions: number[] = [];

		if (card.startable) {
			if (player.home.length && !player.spaces[0].piece) {
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
			movablePieces.push(...boardPieces.map((piece: Piece) => {
				return {
					piece,
					spacePossibilities: this.getSpacePossibilitesForPiece(piece),
				};
			}).reduce((result, { piece, spacePossibilities }): MovablePiece[] => {
				if (!spacePossibilities) {
					return result;
				} else {
					const spaces: Space[] = [];
					movementOptions.forEach((numberOfSpaces: number) => {
						const spacesUnderConsideration: Space[] = spacePossibilities[numberOfSpaces];
						if (spacesUnderConsideration) {
							spacesUnderConsideration.forEach(space => {
								// TODO: Landing on other players!
								if (!space.piece/* || space.piece.player !== player*/) {
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

		return {
			errorMessage,
			movablePieces
		};
	}

	public getSpacePossibilitesForPiece(piece: Piece): any {
		const MAX_CARD_VALUE = 13;
		const MIN_CARD_VALUE = -4;
		if (!piece.space) {
			return false;
		}
		if (piece.space.isGoal) {
			/// something
			return false;
		} else {
			const spacePossibilities = {};
			const currentIndex = this.boardSpaces.findIndex(thisSpace => thisSpace === piece.space);
			let index = currentIndex;
			let moves = 1;
			while (moves <= MAX_CARD_VALUE) {
				index++;
				if (index >= this.boardSpaces.length) {
					index = 0;
				}
				spacePossibilities[moves] = [this.boardSpaces[index]];
				moves++;
			}
			let startMove;
			Object.entries(spacePossibilities).forEach(([movesString, spaces]: [string, Space[]]) => {
				const numberMoves = Number(movesString);
				if (spaces[0].isStart && spaces[0].player === piece.player) {
					startMove = numberMoves;
				}
				if (startMove && numberMoves > startMove) {
					const goalIndex = numberMoves - startMove - 1;
					if (piece.player.goal[goalIndex]) {
						spaces.push(piece.player.goal[goalIndex]);
					}
				}
			});
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
			// console.log(spacePossibilities);
			return spacePossibilities;
		}
	}

	public playCard(player: Player, card: Card, piece?: Piece, space?: Space) {
		if (this.location === 'local') {
			this.executePlayCard(player, card, piece, space);
		} else {
			this.sendAction({
				action: 'play',
				player,
				card,
				piece,
				space
			});
		}
	}

	executePlayCard(player: Player, card: Card, piece?: Piece, space?: Space) {
		let errorMessage = '';

		if (card.startable && !piece.space) {
			if (player.home.length > 0) {
				if (!player.spaces[0].piece) {
					player.spaces[0].piece = player.home.shift();
					player.spaces[0].piece.space = player.spaces[0];
					this.updates.push('home');
				} else {
					errorMessage = 'Home space is already occupied!';
				}
			} else {
				errorMessage = 'No pieces left in home!';
			}
		} else { // if (card.basic && piece && space) {
			// some validation

			const oldSpace = piece.space;

			piece.space = space;
			space.piece = piece;
			oldSpace.piece = null;
		}

		if (errorMessage) {
			alert(errorMessage);
			return false;
		}

		this.log.push({
			player,
			card,
			action: 'play'
		});

		player.hand = player.hand.filter((thisCard: Card) => thisCard !== card);
		this.discard.push(card);
		this.advanceTurn();
		return true;
	}

	public discardCard(player: Player, card: Card, forceDiscard = false): void {
		console.log('Discard Card');
		if (this.location === 'local') {
			this.executeDiscardCard(player, card, forceDiscard);
		} else {
			this.sendAction({
				action: this.hasDiscarded ? 'discard' : 'discardAndDraw',
				player,
				card
			});
		}
	}

	executeDiscardCard(player: Player, card: Card, forceDiscard = false): void {
		player.hand = player.hand.filter((thisCard: Card) => thisCard !== card);

		this.discard.push(card);
		if (this.hasDiscarded || forceDiscard) {
			this.log.push({
				player,
				card,
				action: 'discard'
			});
			this.advanceTurn();
		} else {
			this.hasDiscarded = true;
			player.hand.push(this.drawCard());
			this.log.push({
				player,
				card,
				action: 'discardAndDraw'
			});
			this.save();
			this.sendUpdate();
		}
	}

	buildPlayers(numberOfPlayers: number = 4) {
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

	buildDeck() {
		const cards = [
			{
				symbol: '?',
				quantity: 6,
				startable: true,
				values: [-4, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
			},
			{
				symbol: 'S',
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

	buildBoardSpaces() {
		this.boardSpaces = [];
		this.players.forEach((player: Player) => {
			this.boardSpaces.push(...player.spaces);
		});
	}

	sendAction(item: GameLogItem) {
		this.storage.sendLogItem(item, this.gameId);
	}

	handleMessage(flatItem: FlatGameLogItem) {
		const item = this.hydrateGameLogItem(flatItem);

		if (item.action === 'play') {
			this.executePlayCard(item.player, item.card, item.piece, item.space);
		} else if (item.action === 'discard' || item.action === 'discardAndDraw') {
			this.executeDiscardCard(item.player, item.card);
			if (this.hasDiscarded && item.player.onlineStatus === 'bot') {
				this.takeTurnForPlayer(item.player);
			}
		} else if (item.action === 'join') {
			item.player.onlineStatus = 'online';
			this.save();
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

		return item;
	}

}
