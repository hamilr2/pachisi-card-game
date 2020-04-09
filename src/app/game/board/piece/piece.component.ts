import { Component, OnInit, Input } from '@angular/core';
import { Piece } from '../../piece.model';
import { InterfaceService } from '../../interface.service';

@Component({
	selector: 'app-piece',
	templateUrl: './piece.component.html',
	styleUrls: ['./piece.component.css']
})

export class PieceComponent implements OnInit {
	@Input() piece: Piece;

	constructor(private interfaceService: InterfaceService) { }

	isPieceSelectable() {
		if (this.interfaceService.selectingPiece) {
			if (this.interfaceService.movablePieces.length) {
				return !!this.interfaceService.movablePieces.find(({ piece }) => piece === this.piece);
			}
		}
		return false;
	}

	ngOnInit(): void {
	}

	onClick(event: Event) {
		if (this.isPieceSelectable()) {
			this.interfaceService.selectPiece(this.piece);
			event.stopPropagation();
		}
	}
}
