import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HandComponent } from './hand.component';
import { GameService } from '../game.service';

describe('HandComponent', () => {
	let component: HandComponent;
	let fixture: ComponentFixture<HandComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule ],
			providers: [ GameService ],
			declarations: [ HandComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HandComponent);
		component = fixture.componentInstance;
		const game = TestBed.inject(GameService);
		game.newGame();

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
