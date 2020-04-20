import { Piece } from './piece.model';
import { Card } from './card.model';
import { Space } from './space.model';
import { NUMBER_OF_PLAYERS } from './game.service';

const NUMBER_OF_PIECES = 4;
const GOAL_SIZE = 4;
const SPACES_PER_PLAYER = 16;

interface PlayerOptions {
	color: string;
	id: number;
	name: string;
}

export interface FlatPlayer {
	color: string;
	id: number;
	name: string;
	onlineStatus: string;
	host: boolean;

	goalSpaceIds?: number[];
	handCardIds?: number[];
	homePieceIds?: number[];
	pieceIds?: number[];
	spaceIds?: number[];
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
	host = false;

	constructor(options: PlayerOptions) {
		Object.assign(this, options);

		this.pieces = new Array(NUMBER_OF_PIECES).fill({}).map(({}, index) => new Piece({
			id: Number(this.id * NUMBER_OF_PIECES + index),
			color: this.color,
			player: this
		}));
		this.home = [...this.pieces];

		this.goal = new Array(GOAL_SIZE).fill({}).map(({}, index) => new Space({
			id: Number('' + this.id + ' ' + index),
			isGoal: true,
			player: this
		}));

		this.spaces.push(new Space({
			id: this.id * SPACES_PER_PLAYER,
			player: this,
			isStart: true
		}));

		this.spaces.push(...Array(SPACES_PER_PLAYER - 1).fill({}).map(({}, index) => new Space({
			id: this.id * SPACES_PER_PLAYER + index + 1,
			player: this
		})));
	}
}
