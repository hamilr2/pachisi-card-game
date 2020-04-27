import { CardSpecials, CardOptions, Card } from '../card.model';

export const deckNames = {
	STANDARD_DECK: 'Standard',
	ALL_SEVENS: 'All Sevens'
};

export const STANDARD_DECK: CardOptions[] = [
	{
		symbol: '?',
		quantity: 6,
		startable: true,
		special: CardSpecials.JOKER,
		values: [-4, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
	},
	{
		symbol: 'S',
		special: CardSpecials.SWAP
	},
	{
		symbol: '1/11',
		startable: true,
		values: [1, 11]
	},
	{ value: 2 },
	{ value: 3 },
	{
		symbol: '±4',
		values: [-4, 4]
	},
	{ value: 5 },
	{ value: 6 },
	{
		special: CardSpecials.BURNING,
		value: 7,
		symbol: '7'
	},
	{ value: 8 },
	{ value: 9 },
	{ value: 10 },
	{ value: 12 },
	{
		symbol: '13',
		startable: true,
		values: [13]
	}
];

export const ALL_SEVENS: CardOptions[] = [
	{
		symbol: '7',
		value: 7,
		special: CardSpecials.BURNING,
		quantity: 55
	},
	{
		symbol: '>',
		startable: true,
		quantity: 55
	}
];
