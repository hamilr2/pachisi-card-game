import { CardAction, CardOptions, CardSpecials } from '../card.model';

export const deckNames = {
	STANDARD_DECK: 'Standard',
	ALL_SEVENS: 'All Sevens'
};

export const StandardActions: Record<string, CardAction[]> = {
	JOKER: [
		{
			values: [-4, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13],
			startable: true,
			text: 'Move/Start'
		},
		{
			special: CardSpecials.SWAP,
			text: 'Swap'
		},
		{
			special: CardSpecials.BURNING,
			value: 7,
			text: 'Burning Seven'
		}
	],
	SWAP: [
		{
			special: CardSpecials.SWAP
		}
	],
	BURNING_SEVEN: [
		{
			special: CardSpecials.BURNING, value: 7
		}
	]
};

export const STANDARD_DECK: CardOptions[] = [
	{
		symbol: '?',
		color: 'red',
		quantity: 6,
		actions: StandardActions.JOKER
	},
	{
		symbol: 'S',
		color: 'red',
		actions: StandardActions.SWAP
	},
	{
		symbol: '1/11',
		color: 'red',
		actions: [
			{
				startable: true,
				values: [1, 11]
			}
		]
	},
	{ actions: [{ value: 2 }] },
	{ actions: [{ value: 3 }] },
	{
		symbol: '±4',
		color: 'red',
		actions: [ { values: [-4, 4] }]
	},
	{ actions: [{ value: 5 }] },
	{ actions: [{ value: 6 }] },
	{
		color: 'red',
		actions: StandardActions.BURNING_SEVEN
	},
	{ actions: [{ value: 8 }] },
	{ actions: [{ value: 9 }] },
	{ actions: [{ value: 10 }] },
	{ actions: [{ value: 12 }] },
	{
		color: 'red',
		actions: [{
			value: 13,
			startable: true
		}]
	}
];

export const ALL_SEVENS: CardOptions[] = [
	{
		symbol: '7',
		actions: [{
			value: 7,
			special: CardSpecials.BURNING,
		}],
		quantity: 55
	},
	{
		symbol: '>',
		actions: [{ startable: true }],
		quantity: 55
	}
];
