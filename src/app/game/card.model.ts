
interface CardOptions {
	color?: string;
	symbol: string;
	startable?: boolean;
}

export class Card {
	symbol: string;
	color = 'blue';
	startable = false;

	constructor(options: CardOptions) {
		Object.assign(this, options);
	}
}
