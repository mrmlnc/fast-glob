export function flatFirstLevel<T>(items: T[][]): T[] {
	// We do not use `Array.flat` because this is slower than current implementation for your case.
	// eslint-disable-next-line unicorn/prefer-spread
	return ([] as T[]).concat(...items);
}

export function splitWhen<T>(items: T[], isNextGroup: (item: T) => boolean): T[][] {
	const result: T[][] = [[]];

	let groupIndex = 0;

	for (const item of items) {
		if (isNextGroup(item)) {
			groupIndex++;
			result[groupIndex] = [];
		} else {
			result[groupIndex].push(item);
		}
	}

	return result;
}
