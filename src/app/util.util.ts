export const shuffle = (items: Array<any>) => {
	return items.map(item => {
		return {
			value: item,
			rand: Math.random()
		};
	}).sort(({rand: randA}, { rand: randB}) => {
		return randA - randB;
	}).map(({value}) => value );
};
