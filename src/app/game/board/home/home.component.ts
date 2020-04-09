import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../../player.model';
import { InterfaceService } from '../../interface.service';
import { Piece } from '../../piece.model';
import { GameService } from '../../game.service';
import { Space } from '../../space.model';

const NUM_HOME_SPACES = 4;

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

	@Input() player: Player;

	homeSpaces: Space[];

	constructor(private game: GameService, private interfaceService: InterfaceService) { }

	isPieceSelectable() {
		const firstPiece: Piece = this.player.home[0];
		if (firstPiece && this.interfaceService.selectingPiece) {
			if (this.interfaceService.movablePieces.length) {
				return !!this.interfaceService.movablePieces.find(({ piece }) => piece === firstPiece);
			}
		}
		return false;
	}

	buildHomeSpaces() {
		this.homeSpaces = Array(4).fill({}).map((object, index) => {
			return new Space({
				player: this.player,
				isGoal: true,
				piece: this.player.home[NUM_HOME_SPACES - 1 - index]
			});
		});
	}

	ngOnInit(): void {
		this.buildHomeSpaces();
		this.game.update.subscribe((updates) => {
			if (updates.includes('home')) {
				this.buildHomeSpaces();
			}
		});
	}

}
