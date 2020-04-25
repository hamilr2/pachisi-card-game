import { Piece } from './piece.model';
import { Player } from './player.model';

export interface SpaceOptions {
	id?: number;
	isGoal?: boolean;
	isStart?: boolean;
	piece?: Piece;
	player: Player;
}

export interface FlatSpace {
	id: number;
	isGoal: boolean;
	isStart: boolean;
	pieceId?: number;
	playerId?: number;
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
		if (isNaN(this.id)) {
			this.id = overallCount++;
		}
	}
}
