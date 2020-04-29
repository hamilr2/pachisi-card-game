import { Card } from './card.model';
import { GameInterface } from './game.service';
import { Piece } from './piece.model';
import { Space } from './space.model';

const GOAL_SIZE = 4;
export const SPACES_PER_PLAYER = 16;

interface PlayerOptions {
	flatPlayer?: FlatPlayer;
	color?: string;
	id?: number;
	name?: string;
}

const COPY_PROPS = ['color', 'id', 'name', 'onlineStatus', 'host'];

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

	swapPlayerId?: number;
	swapCardId?: number;
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
	swapPlayer: Player = null;
	swapCard: Card = null;
	onlineStatus = 'bot';
	host = false;

	constructor(options: PlayerOptions, game: GameInterface) {
		if (options.flatPlayer) {
			COPY_PROPS.forEach(prop => {
				this[prop] = options.flatPlayer[prop];
			});
		} else {
			this.initialize(options, game);
		}
	}

	initialize(options: PlayerOptions, game: GameInterface): void {
		Object.assign(this, options);

		const { rules } = game;

		this.pieces = new Array(rules.numberOfPieces).fill({}).map(({}, index) => new Piece({
			id: Number(this.id * rules.numberOfPieces + index),
			color: this.color,
			player: this
		}));
		this.home = [...this.pieces];

		this.goal = new Array(GOAL_SIZE).fill({}).map(({}, index) => new Space({
			id: Number('' + (this.id + 1) + '0' + index),
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

	hydrate(flatPlayer: FlatPlayer, game: GameInterface): void {
		const {
			goalSpaceIds = [],
			handCardIds = [],
			homePieceIds = [],
			pieceIds = [],
			spaceIds = [],
			swapPlayerId,
			swapCardId,
			...rest
		} = flatPlayer;

		this.goal = this.mapper(goalSpaceIds, game.spaces);
		this.hand = this.mapper(handCardIds, game.cards);
		this.spaces = this.mapper(spaceIds, game.spaces);
		this.pieces = this.mapper(pieceIds, game.pieces);
		this.home = this.mapper(homePieceIds, this.pieces);

		this.swapPlayer = game.players.find(player => player.id === swapPlayerId) || null;
		this.swapCard = game.cards.find(card => card.id === swapCardId) || null;
	}

	mapper(sourceIds: number[], searchTarget: any[]) {
		return sourceIds.map(id => searchTarget.find(item => item.id === id));
	}

	flatten(): FlatPlayer {
		const { goal, hand, home, pieces, spaces, swapPlayer, swapCard, ...flatPlayer }: Player & FlatPlayer = this;
		flatPlayer.goalSpaceIds = goal.map(space => space.id);
		flatPlayer.handCardIds = hand.map(card => card.id);
		flatPlayer.homePieceIds = home.map(piece => piece.id);
		flatPlayer.pieceIds = pieces.map(piece => piece.id);
		flatPlayer.spaceIds = spaces.map(space => space.id);
		flatPlayer.swapPlayerId = swapPlayer ? swapPlayer.id : null;
		flatPlayer.swapCardId = swapCard ? swapCard.id : null;

		return flatPlayer;
	}
}
