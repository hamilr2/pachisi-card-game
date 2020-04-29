import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { Player } from './player.model';

describe('Player Model', () => {
	let game: GameService;
	let player: Player;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [GameService]
		});

		game = TestBed.inject(GameService);
		game.newGame();

		player = game.players[0];
	});

	it('should flatten and hydrate to a copy of itself', () => {
		const flatPlayer = player.flatten();
		const newPlayer = new Player({ flatPlayer }, game);
		newPlayer.hydrate(flatPlayer, game);

		expect(player).toEqual(newPlayer);
	});
});
