import { Player } from './player.model';
import { Card, CardAction } from './card.model';
import { Move, FlatMove } from './interfaces';

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
	cardAction?: CardAction;
	moveSet?: Move[];
	cards?: Card[];
}

export interface FlatGameLogItem {
	playerId?: number;
	action: string;
	cardAction?: CardAction;
	cardId?: number;
	moveSet?: FlatMove[];
	cardIds?: number[];
}
