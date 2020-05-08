import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameService } from './game/game.service';
import { LiveService } from './live.service';
import { StorageService } from './storage.service';

describe('Storage Service', () => {
	let storage: StorageService;
	let live: LiveService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ HttpClientTestingModule ],
			providers: [ StorageService, LiveService ]
		});

		storage = TestBed.inject(StorageService);
		live = TestBed.inject(LiveService);
	});

	it ('should flatten and hydrate the game to the same structure', () => {
		const originalGame = new GameService(storage, live);
		originalGame.gameId = 0;
		originalGame.newGame();

		const flatGame = storage.flattenGame(originalGame);
		const quasiGame = storage.hydrateGame(flatGame);
		const newGame = new GameService(storage, live);

		// these steps should probably be abstracted out of the spec
		Object.assign(newGame, quasiGame);
		newGame.buildBoardSpaces();
		newGame.player = newGame.players[0];

		expect(newGame).toEqual(originalGame);

	});
});
