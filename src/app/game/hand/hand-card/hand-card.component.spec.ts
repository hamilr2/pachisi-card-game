import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HandCardComponent } from './hand-card.component';
import { GameService } from '../../game.service';
import { InterfaceService } from '../../interface.service';
import { Card } from '../../card.model';
import { Player } from '../../player.model';

describe('HandCardComponent', () => {
	let component: HandCardComponent;
	let fixture: ComponentFixture<HandCardComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule ],
			providers: [ GameService, InterfaceService ],
			declarations: [ HandCardComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HandCardComponent);
		const game = TestBed.inject(GameService);
		const interfaceService = TestBed.inject(InterfaceService)

		component = fixture.componentInstance;
		component.card = new Card({
			symbol: 'T'
		});

		game.newGame();
		interfaceService.setGame(game, 0);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
