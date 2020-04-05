import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Card } from '../card.model';

@Component({
	selector: 'app-deck',
	templateUrl: './deck.component.html',
	styleUrls: ['./deck.component.css']
})
export class DeckComponent implements OnInit {
	@Input() cards: Card[];
	@Input() visible: boolean;

	constructor() { }

	ngOnInit(): void {
	}

}
