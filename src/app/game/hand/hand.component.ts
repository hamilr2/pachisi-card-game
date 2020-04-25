import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Card } from '../card.model';
import { Player } from '../player.model';

@Component({
	selector: 'app-hand',
	templateUrl: './hand.component.html',
	styleUrls: ['./hand.component.css']
})
export class HandComponent implements OnInit, OnChanges {
	@Input() player: Player;

	builtHand = [];

	constructor() { }

	onCardActiveChange({card, active}: {card: Card, active: boolean}) {
		this.builtHand.forEach((builtHandCard) => {
			if (builtHandCard.card === card) {
				builtHandCard.active = active;
			} else {
				builtHandCard.active = false;
			}
		});
	}

	buildHand() {

		const { hand: cards = [] } = this.player;

		const ROTATION_INTERVAL = 6;
		const HORIZONTAL_SPACING = 40;
		const VERTICAL_SPACING = 5;

		const startingRotation = (cards.length - 1) / 2 * ROTATION_INTERVAL * - 1;
		const startingLeft = (cards.length - 1) / 2 * HORIZONTAL_SPACING * - 1;
		const startingTop = (cards.length - 1) / 2 * VERTICAL_SPACING * -1;

		this.builtHand = cards.map((card: Card, index) => {
			return {
				card,
				rotation: startingRotation + index * ROTATION_INTERVAL,
				left: startingLeft + index * HORIZONTAL_SPACING,
				top: startingTop + index * VERTICAL_SPACING,
				active: false
			};
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		this.buildHand();
	}

	ngOnInit(): void {
		this.buildHand();
	}

}
