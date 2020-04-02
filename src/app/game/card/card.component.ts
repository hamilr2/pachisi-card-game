import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Card } from '../card.model';

@Component({
	selector: 'app-card',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.css']
})

export class CardComponent implements OnInit {
	@Input() card: Card;
	@Output() activeChange = new EventEmitter<{card: Card, active: boolean}>();
	@Output() playCard = new EventEmitter<Card>();
	@Output() discardCard = new EventEmitter<Card>();

	active = false;

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

	constructor() {
	}

	ngOnInit(): void { }

}
