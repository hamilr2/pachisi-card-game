import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../../player.model';
import { InterfaceService } from '../../interface.service';
import { Piece } from '../../piece.model';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	@Input() player: Player;

	constructor(private interfaceService: InterfaceService) { }

	isPieceSelectable() {
		const firstPiece: Piece = this.player.home[0];
		if (firstPiece && this.interfaceService.selectingPiece) {
			if (this.interfaceService.movablePieces.length) {
				return !!this.interfaceService.movablePieces.find(({ piece }) => piece === firstPiece);
			}
		}
		return false;
	}

	ngOnInit(): void {
	}

}
