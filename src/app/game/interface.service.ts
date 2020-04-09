import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { Piece } from './piece.model';
import { Space } from './space.model';
import { Card } from './card.model';
import { Player } from './player.model';
import { MovablePiece } from './interfaces';

@Injectable()

export class InterfaceService {
	activePiece: Piece;
	activeCard: Card;

	selectingPiece = false;
	selectingSpace = false;
	// confirmingMove = false;

	movablePieces: MovablePiece[];
	selectableSpaces: Space[];
	errorMessage: string;

	discardNecessary = false;

	player: Player;

	constructor(private game: GameService) {
		game.update.subscribe(() => { this.onUpdate(); });
		this.onUpdate();
	}

	onUpdate() {
		this.player = this.game.players[0]; // todo, should only be necessary for a new game
		this.discardNecessary = this.isDiscardNecessary(this.player);
	}

	isDiscardNecessary(player: Player) {
		const playables = player.hand.filter((card: Card) => {
			return !!this.game.getMovablePiecesForCard(player, card).movablePieces.length;
		});
		return playables.length === 0;
	}

	attemptPlayCard(player: Player, card: Card) {

		const { movablePieces, errorMessage } = this.game.getMovablePiecesForCard(player, card);
		if (errorMessage) {
			this.errorMessage = errorMessage;
			return false;
		}

		if (movablePieces.length === 0) {
			this.errorMessage = 'No pieces are able to move';
		} else {
			this.activeCard = card;
			this.selectingPiece = true;
			this.movablePieces = movablePieces;
			return true;
		}
	}

	selectPiece(piece: Piece) {
		if (!this.selectingPiece) {
			console.error('Out-of-Sequence');
		}

		this.activePiece = piece;
		this.selectingPiece = false;
		this.selectableSpaces = this.movablePieces.find(({ piece: thisPiece }) => {
			return piece === thisPiece;
		}).spaces;
		this.movablePieces = [];
		this.selectingSpace = true;
	}

	selectSpace(space: Space) {
		this.game.playCard(this.player, this.activeCard, this.activePiece, space);
		this.selectingSpace = false;
		this.activeCard = null;
		this.activePiece = null;
	}

	reset() {
		this.activePiece = null;
		this.activeCard = null;
		this.selectingPiece = false;
		this.selectingSpace = false;
		this.movablePieces = [];
	}
}
