import { Card, CardAction } from './card.model';
import { FlatMove, Move } from './interfaces';
import { Player } from './player.model';

export const GameLogActions = {
	ADVANCE_ROUND: 'advanceRound',
	DEAL: 'deal',
	DISCARD: 'discard',
	DISCARD_DRAW: 'discardAndDraw',
	JOIN: 'join',
	PLAY: 'play',
	SHUFFLE: 'shuffle',
	SWAP: 'swap'
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
