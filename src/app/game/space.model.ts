import { Piece } from './piece.model';
import { Player } from './player.model';

interface SpaceOptions {
	isGoal?: boolean;
	isStart?: boolean;
	player: Player;
}

export class Space {
	isGoal = false;
	isStart = false;
	player: Player;

	piece: Piece;

	constructor(options: SpaceOptions) {
		Object.assign(this, options);
	}
}
