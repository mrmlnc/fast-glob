export function isNegative(pattern: string): boolean {
	return pattern[0] === '!';
}

export function getNegativeAsPositive(patterns: string[]) {
	const results: string[] = [];
	for (let i = 0; i < patterns.length; i++) {
		if (isNegative(patterns[i])) {
			results.push(patterns[i].slice(1));
		}
	}
	return results;
}
