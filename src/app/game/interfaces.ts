import { Piece } from './piece.model';
import { Space } from './space.model';
import { Card } from './card.model';

export interface MovablePiece {
	piece: Piece;
	spaces: Space[];
}

export interface CardResult {
	movablePieces: MovablePiece[];
	errorMessage?: string;
}

export interface UsableCard {
	movablePieces: MovablePiece[];
	card: Card;
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
