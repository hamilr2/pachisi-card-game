import { Component, OnInit } from '@angular/core';
import { Card } from '../../card.model';
import { GameService } from '../../game.service';
import { Subscription } from 'rxjs';
import { GameLogActions } from '../../game-log-item.interface';

const playerLocations = ['bottomLeft', 'topLeft', 'topRight', 'bottomRight'];

export interface AnimatedCard {
	card: Card;
	startPosition: string;
	endPosition: string;
}

@Component({
	selector: 'app-animations',
	templateUrl: './animations.component.html',
	styleUrls: ['./animations.component.css']
})
export class AnimationsComponent implements OnInit {

	actionSubscription: Subscription;
	animatedCards: AnimatedCard[] = [];

	constructor(
		private game: GameService
	) { }

	ngOnInit(): void {
		this.actionSubscription = this.game.actionSubject.subscribe(item => {
			if (item.card) {
				this.animatedCards.push({
					card: item.card,
					startPosition: playerLocations[item.player.id],
					endPosition: item.action === GameLogActions.PLAY ? 'play' : 'discard'
				});
			}
		});
	}

	onDone(card: AnimatedCard) {
		this.animatedCards = this.animatedCards.filter(thisCard => thisCard !== card);
	}

}
