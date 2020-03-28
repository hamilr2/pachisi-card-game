import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Card } from '../card.model';

@Component({
	selector: 'app-card',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.css']
})

export class CardComponent implements OnInit {
	@Input() card: Card;
	@Output() onActiveChange = new EventEmitter<{card: Card, active: boolean}>();
	@Output() onPlayCard = new EventEmitter<Card>();
	@Output() onDiscardCard = new EventEmitter<Card>();

	active: boolean = false;

	onClickCard() {
		this.active = !this.active;
		this.onActiveChange.emit({card: this.card, active: this.active});
	}

	onClickCancel(e: Event) {
		e.stopPropagation();
		this.active = false;
		this.onActiveChange.emit({card: this.card, active: this.active});
	};

	onClickPlay(e: Event) {
		e.stopPropagation();
		this.onPlayCard.emit(this.card);
	}

	onClickDiscard(e: Event) {
		e.stopPropagation();
		this.onDiscardCard.emit(this.card);
	}

	constructor() {
	}

	ngOnInit(): void { }

}
