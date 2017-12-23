export function isNegative(pattern: string): boolean {
	return pattern[0] === '!';
}

export function getNegativeAsPositive(patterns: string[]): string[] {
	const results: string[] = [];

	for (const pattern of patterns) {
		if (isNegative(pattern)) {
			results.push(pattern.slice(1));
		}
	}

	return results;
}
