
interface CardOptions {
	basic?: boolean;
	color?: string;
	startable?: boolean;
	symbol?: string;
	value?: number;
}

export class Card {
	basic = false;
	color = 'blue';
	startable = false;
	symbol: string;
	value: number;

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
