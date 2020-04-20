import { Player } from './player.model';
import { Space } from './space.model';

interface PieceOptions {
	id: number;
	color: string;
	player?: Player;
}

export interface FlatPiece {
	id: number;
	color: string;
	playerId?: number;
	spaceId?: number;
}

export class Piece {
	id: number;
	color: string;
	space: Space;
	player: Player;

	constructor(options: PieceOptions) {
		Object.assign(this, options);
	}
}
