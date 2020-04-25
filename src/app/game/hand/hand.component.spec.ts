import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HandComponent } from './hand.component';
import { Player } from '../player.model';

describe('HandComponent', () => {
	let component: HandComponent;
	let fixture: ComponentFixture<HandComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ HandComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HandComponent);
		component = fixture.componentInstance;
		component.player = new Player({
			color: 'red',
			id: 0,
			name: 'Red'
		});

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
