import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { InterfaceService } from './interface.service';

const PLAYER_ID = 0;

describe('Interface Service', () => {
	let game: GameService;
	let interfaceService: InterfaceService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule ],
			providers: [ GameService, InterfaceService ]
		});

		game = TestBed.inject(GameService);
		interfaceService = TestBed.inject(InterfaceService);
	});

	it('should await player input to select a card to swap on new game', () => {
		game.newGame();
		game.executeAdvanceRound();
		interfaceService.setGame(game, PLAYER_ID);

		expect(interfaceService.selectingSwap).toBeTruthy();
	});

});
