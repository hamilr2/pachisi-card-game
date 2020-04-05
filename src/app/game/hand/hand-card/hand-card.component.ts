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
	@Output() activeChange = new EventEmitter<{card: Card, active: boolean}>();
	@Output() playCard = new EventEmitter<Card>();
	@Output() discardCard = new EventEmitter<Card>();

	active = false;

	constructor(private game: GameService, public interfaceService: InterfaceService) { }

	ngOnInit(): void {
	}

	isPlayable() {
		// Consider adjusting this to the hand
		const player: Player = this.interfaceService.player;
		return !!this.game.getMovablePiecesForCard(player, this.card).movablePieces.length;
	}

	onClickCard() {
		this.active = !this.active;
		this.activeChange.emit({card: this.card, active: this.active});
	}

	onClickCancel(e: Event) {
		e.stopPropagation();
		this.active = false;
		this.activeChange.emit({card: this.card, active: this.active});
	}

	onClickPlay(e: Event) {
		e.stopPropagation();
		this.playCard.emit(this.card);
	}

	onClickDiscard(e: Event) {
		e.stopPropagation();
		this.discardCard.emit(this.card);
	}

}
