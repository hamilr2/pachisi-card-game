import { Player } from './player.model';
import { Card } from './card.model';
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
	moveSet?: Move[];
	cards?: Card[];
}

export interface FlatGameLogItem {
	playerId?: number;
	action: string;
	cardId?: number;
	moveSet?: FlatMove[];
	cardIds?: number[];
}
