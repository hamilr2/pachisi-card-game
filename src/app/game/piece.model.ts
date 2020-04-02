// import { Space } from './space.model';
import { Player } from './player.model';

interface PieceOptions {
	color: string;
	player?: Player;
}

export class Piece {
	color: string;
	// location: Space;
	player: Player;

	constructor(options: PieceOptions) {
		Object.assign(this, options);
	}
}
