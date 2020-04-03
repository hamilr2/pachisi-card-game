import { Card } from './card.model';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { StorageService } from '../storage.service';
import { Space } from './space.model';
import { Player } from './player.model';
import { Piece } from './piece.model';
import { CardResult, MovablePiece } from './interfaces';

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

@Injectable()

export class GameService {

	deck: Card[];
	discard: Card[];
	hand: Card[];
	boardSpaces: Space[];
	players: Player[];
	player: Player;

	hasDiscarded: boolean;
	round: number;
	turn: number;

	@Output() update = new EventEmitter<void>();

	deal() {
		if (this.deck.length === 0) {
			alert('Deck is empty!');
			return false;
		}
		this.hand = [];
		for (let i = 0; i < this.getHandSizeForRound() && this.deck.length > 0; i++) {
			this.hand.push(this.deck.shift());
		}
	}

	public advanceRound() {
		if (this.hand.length > 0) {
			this.discard = [...this.discard, ...this.hand];
		}
		this.round++;
		this.hasDiscarded = false;
		this.turn = 1;
		this.deal();
		this.save();
	}

	advanceTurn() {
		if (this.hand.length === 0) {
			this.advanceRound();
			return;
		}
		this.turn++;
		this.hasDiscarded = false;
		this.save();
		this.update.emit();
	}

	constructor(private storage: StorageService) {
		const loadedGame = storage.loadGame();
		if (loadedGame === false) {
			this.newGame();
		} else {
			Object.assign(this, loadedGame);
			this.buildBoardSpaces();
		}
		this.player = this.players[0];
		this.update.emit();
	}

	newGame() {
		this.discard = [];
		this.hasDiscarded = false;
		this.round = 1;
		this.turn = 1;

		this.buildPlayers();
		this.buildBoardSpaces();

		this.buildDeck();
		this.deck = shuffle(this.deck);
		this.deal();
		this.save();
	}

	save() {
		this.storage.saveGame(this);
	}

	getHandSizeForRound() {
		return HAND_SIZE - ((this.round - 1) % 5);
	}

	public getMovablePiecesForCard(card: Card, player: Player = this.player): CardResult {
		let errorMessage = '';

		if (card.basic) {
			const boardPieces = player.pieces.filter((piece: Piece) => !!piece.space);
			if (boardPieces.length === 0) {
				errorMessage = 'All pieces are still in the Home area!';
			} else {
				const movablePieces = boardPieces.map((piece: Piece) => {
					return {
						piece,
						spacePossibilities: this.getSpacePossibilitesForPiece(piece),
					};
				}).reduce((result, { piece, spacePossibilities }): MovablePiece[] => {
					if (!spacePossibilities.length) {
						return result;
					} else {
						const spaceUnderConsideration = spacePossibilities[card.value - 1];
						if (spaceUnderConsideration.piece && spaceUnderConsideration.piece.player === player) {
							return result;
						} else {
							return [...result, {
								piece,
								spaces: [spaceUnderConsideration]
							}];
						}
					}
				}, []);
				return {
					movablePieces
				}
			}
		} else {
			errorMessage = 'Not Implemented';
		}

		return {
			errorMessage,
			movablePieces: []
		};
	}

	public getSpacePossibilitesForPiece(piece: Piece): Space[] {
		const MAX_CARD_VALUE = 13;
		if (!piece.space) {
			return [];
		}
		if (piece.space.isGoal) {
			/// something
			return [];
		} else {
			const currentIndex = this.boardSpaces.findIndex(thisSpace => thisSpace === piece.space);
			const spacePossibilities = this.boardSpaces.slice(currentIndex + 1, currentIndex + 1 + MAX_CARD_VALUE);
			if (spacePossibilities.length !== MAX_CARD_VALUE) {
				spacePossibilities.push(...this.boardSpaces.slice(0, MAX_CARD_VALUE - spacePossibilities.length));
			}
			const startSpace = spacePossibilities.find(thisSpace => thisSpace.isStart && thisSpace.player === this.player);
			if (startSpace) {
				console.log('Possibility of moving into Home! Not implemented');
			}
			return spacePossibilities;
		}
	}

	public playCard(card: Card, piece?: Piece, space?: Space): boolean {

		let errorMessage = '';

		if (card.startable) {
			if (this.player.home.length > 0) {
				if (!this.player.spaces[0].piece) {
					this.player.spaces[0].piece = this.player.home.shift();
					this.player.spaces[0].piece.space = this.player.spaces[0];
				} else {
					errorMessage = 'Home space is already occupied!';
				}
			} else {
				errorMessage = 'No pieces left in home!';
			}
		} else if (card.basic && piece && space) {
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

		this.hand = this.hand.filter((thisCard: Card) => thisCard !== card);
		this.discard.push(card);
		this.advanceTurn();
		return true;
	}

	public discardCard(card: Card): void {
		this.hand = this.hand.filter((thisCard: Card) => thisCard !== card);
		this.discard.push(card);
		if (this.hasDiscarded) {
			this.advanceTurn();
		} else {
			this.hasDiscarded = true;
			this.hand.push(this.deck.shift());
			this.save();
			this.update.emit();
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
				startable: true
			},
			{
				symbol: 'S',
			},
			{
				symbol: '1/11',
				startable: true
			},
			{ value: 2 },
			{ value: 3 },
			{
				symbol: '±4',
			},
			{ value: 5 },
			{ value: 6 },
			{
				symbol: '7',
			},
			{ value: 8 },
			{ value: 9 },
			{ value: 10 },
			{ value: 12 },
			{
				symbol: '13',
				startable: true
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
