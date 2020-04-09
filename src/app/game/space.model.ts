import { Piece } from './piece.model';
import { Player } from './player.model';

interface SpaceOptions {
	isGoal?: boolean;
	isStart?: boolean;
	player: Player;
}

let overallCount = 0;

export class Space {
	isGoal = false;
	isStart = false;
	player: Player;

	piece: Piece;

	id: number;

	constructor(options: SpaceOptions) {
		Object.assign(this, options);
		this.id = overallCount++;
	}
}
