import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from '../card.model';
import { CardComponent } from '../card/card.component';
import { DeckComponent } from './deck.component';


describe('DeckComponent', () => {
	let component: DeckComponent;
	let fixture: ComponentFixture<DeckComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ DeckComponent, CardComponent ]
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
