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

	id: number;
	location: string;
	initialized = false;

	constructor(
		public game: GameService,
		public interfaceService: InterfaceService,
		private route: ActivatedRoute
	) { }

	ngOnInit(): void {
		this.id = Number(this.route.snapshot.params.id);
		this.location = this.route.snapshot.params.location;
		this.game.majorUpdate.subscribe(() => {
			this.initialized = true;
			this.interfaceService.setGame(this.game);
		});
		this.game.loadGame(this.id, this.location);
	}

	onClick() {
		this.interfaceService.reset();
	}

}
