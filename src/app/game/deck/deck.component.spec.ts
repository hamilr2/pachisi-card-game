import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckComponent } from './deck.component';
import { Card } from '../card.model';

describe('DeckComponent', () => {
	let component: DeckComponent;
	let fixture: ComponentFixture<DeckComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ DeckComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DeckComponent);
		component = fixture.componentInstance;
		component.cards = [new Card({
			symbol: 'T'
		})];
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
