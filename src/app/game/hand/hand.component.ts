import { Component, OnInit, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { Card } from '../card.model';
import { Player } from '../player.model';
import { Subscription } from 'rxjs';
import { GameService } from '../game.service';

@Component({
	selector: 'app-hand',
	templateUrl: './hand.component.html',
	styleUrls: ['./hand.component.css']
})
export class HandComponent implements OnInit, OnDestroy {
	@Input() player: Player;
	subscription: Subscription;

	builtHand = [];

	constructor(
		private game: GameService
	) { }

	onCardActiveChange({card, active}: {card: Card, active: boolean}): void {
		this.builtHand.forEach((builtHandCard) => {
			if (builtHandCard.card === card) {
				builtHandCard.active = active;
			} else {
				builtHandCard.active = false;
			}
		});
	}

	buildHand(): void {

		const { player: { hand: cards = [] } } = this.game;

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

	ngOnInit(): void {
		this.buildHand();
		this.subscription = this.game.update.subscribe(() => {
			this.buildHand();
		});
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

}
