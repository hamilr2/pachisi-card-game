
export interface CardOptions {
	id?: number;
	basic?: boolean;
	color?: string;
	quantity?: number;
	special?: string;
	startable?: boolean;
	symbol?: string;
	value?: number;
	values?: number[];
}

export const CardSpecials = {
	SWAP: 'swap',
	BURNING: 'burning',
	JOKER: 'joker'
};

export class Card {
	id: number;
	basic = false;
	color = 'blue';
	special: string;
	startable = false;
	symbol: string;
	value: number;
	values: number[];

	constructor(options: CardOptions) {
		Object.assign(this, options);

		if (!options.color) {
			if (this.symbol) {
				this.color = 'red';
			} else if (this.value) {
				this.basic = true;
				this.symbol = `${this.value}`;
			}
		}
	}
}
