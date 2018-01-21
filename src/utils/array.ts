/**
 * Flatten nested arrays (max depth is 2) into a non-nested array of non-array items.
 */
export function flatten<T>(items: T[][]): T[] {
	return items.reduce((collection, item) => ([] as T[]).concat(collection, item), [] as T[]);
}

/**
 * Returns max number from array.
 */
export function max(items: Array<{}>): number {
	return Math.max.apply(null, items);
}
