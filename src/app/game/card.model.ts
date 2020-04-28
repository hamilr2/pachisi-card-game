
export interface CardOptions {
	id?: number;
	basic?: boolean;
	color?: string;
	quantity?: number;
	symbol?: string;
	actions?: CardAction[];
}

export interface CardAction {
	value?: number;
	values?: number[];
	startable?: boolean;
	special?: string;
	text?: string;
}

export const CardSpecials = {
	SWAP: 'swap',
	BURNING: 'burning',
	// JOKER: 'joker'
};

export class Card {
	id: number;
	basic = false;
	color = 'blue';
	symbol: string;
	actions: CardAction[] = [];

	constructor(options: CardOptions) {
		Object.assign(this, options);
		if (!this.symbol && this.actions.length && this.actions[0].value) {
			this.symbol = `${this.actions[0].value}`;
		}
	}
}
