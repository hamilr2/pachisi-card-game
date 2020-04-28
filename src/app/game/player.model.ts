import { Card } from './card.model';
import { GameRules } from './game.service';
import { Piece } from './piece.model';
import { Space } from './space.model';

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

	constructor(options: PlayerOptions, rules: GameRules) {
		Object.assign(this, options);

		this.pieces = new Array(rules.numberOfPieces).fill({}).map(({}, index) => new Piece({
			id: Number(this.id * rules.numberOfPieces + index),
			color: this.color,
			player: this
		}));
		this.home = [...this.pieces];

		this.goal = new Array(GOAL_SIZE).fill({}).map(({}, index) => new Space({
			id: Number('' + this.id + '0' + index),
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
