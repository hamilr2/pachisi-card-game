import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { Piece } from './piece.model';
import { Space } from './space.model';
import { Card, CardSpecials, CardAction } from './card.model';
import { Player } from './player.model';
import { MovablePiece, Move, FullMove } from './interfaces';
import { Subject } from 'rxjs';

@Injectable()

export class InterfaceService {

	game: GameService;
	update = new Subject<void>();

	activeCard: Card;
	activeAction: CardAction;
	activePiece: Piece;

	selectingPiece = false;
	selectingSpace = false;

	// confirmingMove = false;

	moveSet: Move[] = [];
	mockMoves: FullMove[] = [];

	movablePieces: MovablePiece[];
	selectableSpaces: Space[];
	errorMessage: string;

	burningRemaining = 0;

	discardNecessary = false;

	player: Player;

	constructor() { }

	setGame(game: GameService, playerId: number) {
		if (this.game) {
			this.game.update.unsubscribe();
		}

		this.game = game;
		this.player = this.game.players[playerId];
		this.game.update.subscribe(() => {
			this.onUpdate();
		});
		this.onUpdate();
	}

	onUpdate() {
		this.discardNecessary = this.isDiscardNecessary();
	}

	isDiscardNecessary(player: Player = this.player) {
		const usableCards = this.game.getUsableCards(player);
		return usableCards.length === 0;
	}

	attemptPlayCard(card: Card, action: CardAction) {

		const { movablePieces, errorMessage } = this.game.getMovablePiecesForAction(this.player, action);
		if (errorMessage) {
			this.errorMessage = errorMessage;
			return false;
		}

		if (movablePieces.length === 0) {
			this.errorMessage = 'No pieces are able to move';
		} else {
			this.activeCard = card;
			this.activeAction = action;
			this.selectingPiece = true;
			this.movablePieces = movablePieces;
			if (action.special === CardSpecials.BURNING) {
				this.burningRemaining = action.value;
			}
			this.update.next();
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
		this.update.next();
	}

	cancelSelectingSpace() {
		this.activePiece = null;
		this.selectingPiece = true;
		this.selectingSpace = false;
		this.update.next();
	}

	selectSpace(space: Space) {
		const move = {
			space,
			piece: this.activePiece
		};
		this.moveSet.push(move);
		if (this.burningRemaining) {
			this.burningRemaining -= this.game.getDistanceBetweenSpaces(this.activePiece.space, space);
			if (this.burningRemaining > 0) {
				this.selectingPiece = true;
				this.selectingSpace = false;
				this.activePiece = null;
				const fullMoves = this.game.createFullMoves(this.player, this.activeAction, move).fullMoves;
				this.mockMoves.push(...fullMoves);
				fullMoves.forEach(fullMove => this.game.performMove(fullMove));
				this.movablePieces = this.game.getMovablePiecesForAction(this.player, this.activeAction, this.burningRemaining).movablePieces;
				this.update.next();
				return;
			}
		}
		if (this.mockMoves.length) {
			this.mockMoves.reverse().forEach(mockMove => this.game.undoMove(mockMove));
			this.mockMoves = [];
		}
		this.game.playCard(this.player, this.activeCard, this.activeAction, this.moveSet);
		this.reset();
	}

	reset() {
		this.activePiece = null;
		this.activeCard = null;
		this.activeAction = null;
		this.selectingPiece = false;
		this.selectingSpace = false;
		this.movablePieces = [];
		this.moveSet = [];
		this.burningRemaining = 0;
		this.mockMoves.reverse().forEach(mockMove => this.game.undoMove(mockMove));
		this.mockMoves = [];
		this.update.next();
	}
}
