import { TPattern } from '../types/patterns';

export function isNegative(pattern: TPattern): boolean {
	return pattern[0] === '!';
}

export function getNegativeAsPositive(patterns: TPattern[]): TPattern[] {
	const results: TPattern[] = [];

	for (const pattern of patterns) {
		if (isNegative(pattern)) {
			results.push(pattern.slice(1));
		}
	}

	return results;
}
