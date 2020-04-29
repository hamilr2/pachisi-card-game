import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from '../../card.model';
import { CardComponent } from '../../card/card.component';
import { StandardActions } from '../../deck/decks.util';
import { GameService } from '../../game.service';
import { InterfaceService } from '../../interface.service';
import { HandCardComponent } from './hand-card.component';


describe('HandCardComponent', () => {
	let component: HandCardComponent;
	let fixture: ComponentFixture<HandCardComponent>;

	let game: GameService;
	let interfaceService: InterfaceService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule ],
			providers: [ GameService, InterfaceService ],
			declarations: [ HandCardComponent, CardComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HandCardComponent);
		component = fixture.componentInstance;

		game = TestBed.inject(GameService);
		interfaceService = TestBed.inject(InterfaceService);

		game.newGame();
		game.executeAdvanceRound();
		game.selectCardForSwap(game.player, game.player.hand[0]);

		interfaceService.setGame(game, 0);
		interfaceService.discardNecessary = false;
	});

	it('should create', () => {
		component.card = new Card({
			symbol: 'T'
		});

		fixture.detectChanges();
		expect(component).toBeTruthy();
	});

	it('should provide a play button for a standard card', () => {
		component.card = new Card({
			symbol: '2',
			actions: [{ value: 2 }]
		});

		component.playable = true;
		component.active = true;

		fixture.detectChanges();

		const buttons = fixture.nativeElement.querySelectorAll('button');

		expect(buttons).toBeTruthy();
		expect(buttons.length).toEqual(1);
		expect(buttons[0].innerText).toEqual('Play');
	});

	it ('should provide three buttons for a joker', () => {
		component.card = new Card({
			symbol: '?',
			actions: StandardActions.JOKER
		});
		component.playable = true;
		component.active = true;

		fixture.detectChanges();

		const buttons = fixture.nativeElement.querySelectorAll('button');

		expect(buttons).toBeTruthy();
		expect(buttons.length).toEqual(3);
		expect(buttons.item(0).innerText).toEqual(component.card.actions[0].text);
	});

	it ('should only show the swap button if we\'re swapping', () => {
		game.executeAdvanceRound();

		component.card = new Card({
			symbol: '2',
			actions: [{ value: 2 }]
		});

		component.active = true;
		fixture.detectChanges();

		const buttons = fixture.nativeElement.querySelectorAll('button');

		expect(buttons).toBeTruthy();
		expect(buttons.length).toEqual(1);
		expect(buttons.item(0).innerText).toEqual('Swap');

	})
});
