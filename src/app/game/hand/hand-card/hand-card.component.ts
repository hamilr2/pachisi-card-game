import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Card } from '../../card.model';
import { GameService } from '../../game.service';
import { InterfaceService } from '../../interface.service';
import { Player } from '../../player.model';

@Component({
	selector: 'app-hand-card',
	templateUrl: './hand-card.component.html',
	styleUrls: ['./hand-card.component.css']
})
export class HandCardComponent implements OnInit {
	@Input() card: Card;
	@Input() active: boolean;
	@Output() activeChange = new EventEmitter<{card: Card, active: boolean}>();

	constructor(private game: GameService, public interfaceService: InterfaceService) { }

	ngOnInit(): void { }

	isBeingPlayed() {
		return this.interfaceService.activeCard === this.card;
	}

	isPlayable() {
		// Consider adjusting this to the hand
		const player: Player = this.interfaceService.player;
		const hasMovablePieces = !!this.game.getMovablePiecesForCard(player, this.card).movablePieces.length;
		return hasMovablePieces;
	}

	onClickCard() {
		this.activeChange.emit({card: this.card, active: !this.active});
	}

	onClickCancel(e: Event) {
		e.stopPropagation();
		this.activeChange.emit({card: this.card, active: false});
		this.interfaceService.reset();
	}

	onClickPlay(e: Event) {
		e.stopPropagation();
		this.interfaceService.attemptPlayCard(this.card);
	}

	onClickDiscard(e: Event) {
		e.stopPropagation();
		this.game.discardCard(this.interfaceService.player, this.card);
	}

}
