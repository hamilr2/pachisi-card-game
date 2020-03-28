

export class Card {
	symbol: string;
	color: string;

	constructor({symbol, color = 'blue'}: {symbol: string, color?: string}) {
		this.symbol = symbol;
		this.color = color;
	}
}