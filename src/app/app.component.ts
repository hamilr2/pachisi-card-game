import { Component } from '@angular/core';
import { Card } from './card.model';

const shuffle = (items: Array<any>) => {
	return items.map(item => {
		return {
			value: item,
			rand: Math.random()
		}
	}).sort(({rand: randA}, { rand: randB}) => {
		return randA-randB;
	}).map(({value}) => value );
};

const HAND_SIZE = 6;
const DEFAULT_CARD_QUANTITY = 8;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {
	title = 'dog';

	deck = [];
	discard = [];
	hand = [];
	
	hasDiscarded = false;
	round = 1;
	turn = 1;

	deal() {
		if (this.deck.length == 0) {
			alert('Deck is empty!');
			return false;
		}
		this.hand = [];
		for (let i = 0; i < this.getHandSizeForRound() && this.deck.length > 0; i++) {
			this.hand.push(this.deck.shift());
		};
	}

	advanceRound() {
		this.round++;
		this.hasDiscarded = false;
		this.turn = 1;
		this.deal();
	}

	advanceTurn() {
		if (this.hand.length === 0) {
			this.advanceRound();
			return;
		}
		this.turn++;
		this.hasDiscarded = false;
	}

	constructor() {
		this.buildDeck();
		this.deck = shuffle(this.deck);
		this.deal();
	}

	getHandSizeForRound() {
		return HAND_SIZE - ((this.round - 1) % 5);
	}

	onDrawNewHand() {
		this.discard = [...this.discard, ...this.hand];
		this.round++;
		this.deal();
	}

	onPlayCard(card: Card) {
		this.hand = this.hand.filter((thisCard: Card) => thisCard !== card);
		this.discard.push(card);
		this.advanceTurn();
	}

	onDiscardCard(card: Card) {
		this.hand = this.hand.filter((thisCard: Card) => thisCard !== card);
		this.discard.push(card);
		if (this.hasDiscarded) {
			this.advanceTurn();
		} else {
			this.hasDiscarded = true;
			this.hand.push(this.deck.shift());
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
