import { Piece } from './piece.model';
import { Space } from './space.model';

export interface MovablePiece {
	piece: Piece;
	spaces: Space[];
}

export interface CardResult {
	movablePieces: MovablePiece[];
	errorMessage?: string;
}
