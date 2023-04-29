export function flatFirstLevel<T>(items: T[][]): T[] {
	// We do not use `Array.flat` because this is slower than current implementation for your case.
	// eslint-disable-next-line unicorn/prefer-array-flat
	return items.reduce((collection, item) => collection.concat(item), []);
}

export function splitWhen<T>(items: T[], predicate: (item: T) => boolean): T[][] {
	const result: T[][] = [[]];

	let groupIndex = 0;

	for (const item of items) {
		if (predicate(item)) {
			groupIndex++;
			result[groupIndex] = [];
		} else {
			result[groupIndex].push(item);
		}
	}

	return result;
}
