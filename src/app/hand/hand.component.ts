import { Component, EventEmitter, OnInit, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { Card } from '../card.model';

@Component({
	selector: 'app-hand',
	templateUrl: './hand.component.html',
	styleUrls: ['./hand.component.css']
})
export class HandComponent implements OnInit, OnChanges {
	@Input() cards: Card[];
	@Output() onDrawNewHand = new EventEmitter();
	@Output() onPlayCard = new EventEmitter<Card>();
	@Output() onDiscardCard = new EventEmitter<Card>();

	builtHand = [];

	onClickDrawNewHand() {
		this.onDrawNewHand.emit();
	}

	onCardPlayCard(card: Card) {
		this.onPlayCard.emit(card);
	}

	onCardDiscardCard(card: Card){
		this.onDiscardCard.emit(card);
	}

	onCardActiveChange({card, active}: {card: Card, active: boolean}) {
		this.builtHand.find(({card: thisCard}) => thisCard === card).active = active;
	}

	buildHand() {

		const ROTATION_INTERVAL = 6;
		const HORIZONTAL_SPACING = 40;
		const VERTICAL_SPACING = 5;

		const startingRotation = (this.cards.length-1) / 2 * ROTATION_INTERVAL * - 1;
		const startingLeft = (this.cards.length-1) / 2 * HORIZONTAL_SPACING * - 1;
		const startingTop = (this.cards.length-1) / 2 * VERTICAL_SPACING * -1;

		this.builtHand = this.cards.map((card: Card, index) => {
			return {
				card,
				rotation: startingRotation + index * ROTATION_INTERVAL,
				left: startingLeft + index * HORIZONTAL_SPACING,
				top: startingTop + index * VERTICAL_SPACING,
				active: false
			}
		})
	}

	constructor() { }

	ngOnChanges(changes: SimpleChanges) {
		this.buildHand();
	}

	ngOnInit(): void {
		this.buildHand();
	}

}
