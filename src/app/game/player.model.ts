import { Piece } from './piece.model';
import { Card } from './card.model';
import { Space } from './space.model';

const NUMBER_OF_PIECES = 4;
const GOAL_SIZE = 4;
const SPACES_PER_PLAYER = 16;

interface PlayerOptions {
	color: string;
	id: number;
	name: string;
}

export class Player {
	color: string;
	goal: Space[] = [];
	hand: Card[] = [];
	home: Piece[] = [];
	id: number;
	name: string;
	pieces: Piece[] = [];
	spaces: Space[] = [];
	onlineStatus = 'bot';

	constructor(options: PlayerOptions) {
		Object.assign(this, options);

		this.pieces = new Array(NUMBER_OF_PIECES).fill({}).map(() => new Piece({
			color: this.color,
			player: this
		}));
		this.home = [...this.pieces];

		this.goal = new Array(GOAL_SIZE).fill({}).map(() => new Space({
			isGoal: true,
			player: this
		}));

		this.spaces.push(new Space({
			player: this,
			isStart: true
		}));

		this.spaces.push(...Array(SPACES_PER_PLAYER - 1).fill({}).map(() => new Space({
			player: this
		})));
	}
}
