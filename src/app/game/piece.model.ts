import { Player } from './player.model';
import { Space } from './space.model';

interface PieceOptions {
	color: string;
	player?: Player;
}

export class Piece {
	color: string;
	space: Space;
	player: Player;

	constructor(options: PieceOptions) {
		Object.assign(this, options);
	}
}
