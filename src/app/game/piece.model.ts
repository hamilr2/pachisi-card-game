import { GameInterface } from './game.service';
import { Player } from './player.model';
import { Space } from './space.model';

interface PieceOptions {
	id?: number;
	color?: string;
	player?: Player;

	flatPiece?: FlatPiece;
}

const COPY_PROPS = ['id', 'color'];

export interface FlatPiece {
	id: number;
	color: string;
	playerId?: number;
	spaceId?: number;
}

export class Piece {
	id: number;
	color: string;
	space: Space = null;
	player: Player;

	constructor(options: PieceOptions) {
		if (options.flatPiece) {
			COPY_PROPS.forEach(prop => {
				this[prop] = options.flatPiece[prop];
			});
		} else {
			Object.assign(this, options);
		}
	}

	hydrate(flatPiece: FlatPiece, game: GameInterface): void {
		const { spaceId, playerId } = flatPiece;
		this.space = !isNaN(Number(spaceId)) ? game.spaces.find(space => space.id === spaceId) : null;
		this.player = game.players.find(player => player.id === playerId);
	}
}
