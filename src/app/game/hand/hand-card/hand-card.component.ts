import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card, CardAction } from '../../card.model';
import { GameService } from '../../game.service';
import { InterfaceService } from '../../interface.service';

@Component({
	selector: 'app-hand-card',
	templateUrl: './hand-card.component.html',
	styleUrls: ['./hand-card.component.css']
})

export class HandCardComponent implements OnInit {
	@Input() card: Card;
	@Input() active: boolean;
	@Input() playable: boolean;
	@Output() activeChange = new EventEmitter<{card: Card, active: boolean}>();

	CardActions: CardAction[];

	constructor(private game: GameService, public interfaceService: InterfaceService) { }

	ngOnInit(): void { }

	isBeingPlayed() {
		return this.interfaceService.activeCard === this.card;
	}

	isPlayDisabled() {
		return this.isBeingPlayed() || this.game.activePlayer !== this.game.player;
	}

	onClickCard() {
		this.activeChange.emit({card: this.card, active: !this.active});
	}

	onClickCancel(e: Event) {
		e.stopPropagation();
		this.activeChange.emit({card: this.card, active: false});
		this.interfaceService.reset();
	}

	onClickDiscard(e: Event) {
		e.stopPropagation();
		this.game.discardCard(this.interfaceService.player, this.card);
	}

	onClickAction(action: CardAction, e: Event) {
		e.stopPropagation();
		this.interfaceService.attemptPlayCard(this.card, action);
	}

	onSwapClick(e: Event) {
		e.stopPropagation();
		this.interfaceService.selectSwap(this.card);
	}

}
