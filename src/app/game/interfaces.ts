import { Piece } from './piece.model';
import { Space } from './space.model';
import { Card, CardAction } from './card.model';

export interface MovablePiece {
	piece: Piece;
	spaces: Space[];
}

export interface CardResult {
	movablePieces: MovablePiece[];
	errorMessage?: string;
}

export interface UsableCard {
	usableActions: UsableAction[];
	card: Card;
}

export interface UsableAction {
	action: CardAction;
	movablePieces: MovablePiece[];
}

export interface FlatMove {
	pieceId: number;
	spaceId: number;
}

export interface Move {
	piece: Piece;
	space: Space;
}

export interface FullMove {
	piece: Piece;
	startSpace?: Space;
	endSpace?: Space;
}

export interface MoveResult {
	errorMessage?: string;
	fullMoves: FullMove[];
}
