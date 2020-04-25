import { Player } from './player.model';
import { Card } from './card.model';
import { Piece } from './piece.model';
import { Space } from './space.model';

export const GameLogActions = {
	DISCARD: 'discard',
	DISCARD_DRAW: 'discardAndDraw',
	PLAY: 'play',
	SHUFFLE: 'shuffle',
	JOIN: 'join',
	DEAL: 'deal',
	ADVANCE_ROUND: 'advanceRound'
};

export interface GameLogItem {
	player?: Player;
	action: string;
	card?: Card;
	piece?: Piece;
	space?: Space;
	cards?: Card[];
}

export interface FlatGameLogItem {
	playerId?: number;
	action: string;
	cardId?: number;
	pieceId?: number;
	spaceId?: number;
	cardIds?: number[];
}
