import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Card } from '../card.model';

@Component({
	selector: 'app-card',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.css']
})

export class CardComponent implements OnChanges , OnInit {
	@Input() card?: Card;

	constructor() { }

	setDefaultCard() {
		if (!this.card) {
			this.card = new Card({
				symbol: 'Dog',
				color: 'blue'
			});
		}
	}


	ngOnInit(): void {
		this.setDefaultCard();
	}

	ngOnChanges(): void {
		this.setDefaultCard();
	}

}
