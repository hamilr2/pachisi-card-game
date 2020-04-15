import { Card } from './card.model';
import { Injectable, Output } from '@angular/core';
import { StorageService } from '../storage.service';
import { Space } from './space.model';
import { Player } from './player.model';
import { Piece } from './piece.model';
import { CardResult, MovablePiece } from './interfaces';
import { Subject } from 'rxjs';

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

const HAND_SIZE = 6;
const DEFAULT_CARD_QUANTITY = 8;
const ACTION_DELAY = 100;

@Injectable()

export class GameService {

	gameId: number;
	location: string;

	deck: Card[];
	discard: Card[];

	boardSpaces: Space[];
	players: Player[];
	player: Player;

	hasDiscarded: boolean;
	round: number;
	turn: number;
	activePlayer: Player;

	updates: string[] = [];

	update = new Subject<string[]>();
	majorUpdate = new Subject<void>();

	sendUpdate(updates: string[] = []) {
		this.update.next([...updates, ...this.updates]);
		this.updates = [];
	}

	deal() {
		if (this.deck.length === 0) {
			alert('Deck is empty!');
			return false;
		}
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
		/*if (this.hand.length > 0) {
			this.discard = [...this.discard, ...this.hand];
		}*/
		this.round++;
		this.hasDiscarded = false;
		this.turn = 1; // 0 for swapping in the future
		this.deal();
		this.save();
	}

	advanceTurn() {
		// if (this.turn === this.getHandSizeForRound() * this.players.length) {
		// TODO: Fix static reference to this.player
		this.turn++;
		this.setActivePlayer();
		if (this.activePlayer.hand.length === 0) {
			this.advanceRound();
			return;
		}
		this.hasDiscarded = false;
		this.save();
		this.sendUpdate();
		if (this.activePlayer !== this.player) {
			this.takeTurnForPlayer(this.activePlayer);
		}
	}

	takeTurnForPlayer(player: Player) {
		setTimeout(() => {
			this.discardCard(player, player.hand[0], true);
		}, ACTION_DELAY);
	}

	setActivePlayer() {
		this.activePlayer = this.players[(this.turn - 1) % this.players.length];
	}

	constructor(private storage: StorageService) { }

	loadGame(id: number, location: string) {
		this.location = location;
		this.gameId = id;

		this.storage.loadGame(id, location).subscribe((loadedGame) => {

			if (loadedGame === false) {
				this.newGame();
			} else {
				Object.assign(this, loadedGame);
				this.buildBoardSpaces();
			}

			this.setActivePlayer();
			this.player = this.players[0];
			this.save();
			this.majorUpdate.next();
			this.sendUpdate();
		});
	}

	newGame() {
		this.discard = [];
		this.hasDiscarded = false;
		this.round = 1;
		this.turn = 1;

		this.buildPlayers();
		this.player = this.players[0];
		this.buildBoardSpaces();

		this.buildDeck();
		this.deck = shuffle(this.deck);
		this.deal();
	}

	save() {
		this.storage.saveGame(this, this.gameId);
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

	public playCard(player: Player, card: Card, piece?: Piece, space?: Space): boolean {

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

		player.hand = player.hand.filter((thisCard: Card) => thisCard !== card);
		this.discard.push(card);
		this.advanceTurn();
		return true;
	}

	public discardCard(player: Player, card: Card, forceDiscard = false): void {
		player.hand = player.hand.filter((thisCard: Card) => thisCard !== card);
		this.discard.push(card);
		if (this.hasDiscarded || forceDiscard) {
			this.advanceTurn();
		} else {
			this.hasDiscarded = true;
			player.hand.push(this.drawCard());
			this.save();
			this.sendUpdate();
		}
	}

	buildPlayers(numberOfPlayers: number = 4) {
		this.players = [];
		const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];
		for (let i = 0; i < numberOfPlayers; i++) {
			this.players.push(new Player({
				color: colors[i],
				id: i
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

		this.deck = cards.reduce((deck, card) => {
			deck = [...deck, ...Array(card.quantity || DEFAULT_CARD_QUANTITY).fill({}).map(() => new Card(card))];
			return deck;
		}, []);
	}

	buildBoardSpaces() {
		this.boardSpaces = [];
		this.players.forEach((player: Player) => {
			this.boardSpaces.push(...player.spaces);
		});
	}
}
