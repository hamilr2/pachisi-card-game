import { Card } from './card.model';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';

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
	hasDiscarded: boolean;
	round: number;
	turn: number;

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
	}

	constructor(private storage: StorageService) {
		const loadedGame = storage.loadGame();
		if (loadedGame === false) {
			this.newGame();
		} else {
			Object.assign(this, loadedGame);
		}
	}

	newGame() {
		this.discard = [];
		this.hasDiscarded = false;
		this.round = 1;
		this.turn = 1;

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

	public playCard(card: Card): void {
		this.hand = this.hand.filter((thisCard: Card) => thisCard !== card);
		this.discard.push(card);
		this.advanceTurn();
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
		}
	}

	buildDeck() {
		const cards = [
			{
				symbol: '?',
				color: 'red',
				quantity: 6,
			},
			{
				symbol: 'S',
				color: 'red',
			},
			{
				symbol: '1/11',
				color: 'red'
			},
			{ symbol: '2' },
			{ symbol: '3' },
			{
				symbol: '±4',
				color: 'red'
			},
			{ symbol: '5' },
			{ symbol: '6' },
			{
				symbol: '7',
				color: 'red'
			},
			{ symbol: '8' },
			{ symbol: '9' },
			{ symbol: '10' },
			{ symbol: '12' },
			{ symbol: '13' }
		];

		this.deck = cards.reduce((deck, card) => {
			deck = [...deck, ...Array(card.quantity || DEFAULT_CARD_QUANTITY).fill({}).map(() => new Card(card))];
			return deck;
		}, []);
	}
}
