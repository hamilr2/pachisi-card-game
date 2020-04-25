import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GameService } from './game.service';

describe('GameComponent', () => {

	let game: GameService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [GameService]
		});

		game = TestBed.inject(GameService);
		game.newGame();
	});

	it('should have four players', () => {
		expect(game.players.length).toEqual(4);
	});
});
