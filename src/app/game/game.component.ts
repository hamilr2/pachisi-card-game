import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import { InterfaceService } from './interface.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css'],
	providers: [GameService, InterfaceService]
})
export class GameComponent implements OnInit {

	gameId: number;
	playerId: number;
	location: string;
	initialized = false;

	constructor(
		public game: GameService,
		public interfaceService: InterfaceService,
		private route: ActivatedRoute
	) { }

	ngOnInit(): void {
		this.gameId = Number(this.route.snapshot.params.gameId);
		this.location = this.route.snapshot.params.location;
		this.playerId = Number(this.route.snapshot.params.playerId) - 1; // actual id is array indexed
		this.game.majorUpdate.subscribe(() => {
			this.initialized = true;
			this.interfaceService.setGame(this.game, this.playerId);
		});
		this.game.loadGame(this.gameId, this.location, this.playerId);
	}

	onClick() {
		this.interfaceService.reset();
	}

}
