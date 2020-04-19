import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../player.model';
import { GameService } from '../game.service';

@Component({
	selector: 'app-player-corner',
	templateUrl: './player-corner.component.html',
	styleUrls: ['./player-corner.component.css']
})
export class PlayerCornerComponent implements OnInit {
	@Input() player: Player;
	@Input() corner: string;

	constructor(
		public game: GameService
	) { }

	ngOnInit(): void {
	}

}
