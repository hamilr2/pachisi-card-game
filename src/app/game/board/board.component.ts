import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { Player } from '../player.model';

@Component({
	selector: 'app-board',
	templateUrl: './board.component.html',
	styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

	players: Player[];

	constructor(public game: GameService) { }

	ngOnInit(): void {
		this.game.majorUpdate.subscribe(() => {
			this.players = this.game.players;
		});
		this.players = this.game.players;
	}

}
