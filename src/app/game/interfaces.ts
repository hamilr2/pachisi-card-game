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
