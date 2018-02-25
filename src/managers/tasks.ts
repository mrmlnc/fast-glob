import * as patternUtils from '../utils/pattern';

import { Pattern, PatternsGroup } from '../types/patterns';
import { IOptions } from './options';

export interface ITask {
	base: string;
	dynamic: boolean;
	patterns: Pattern[];
	positive: Pattern[];
	negative: Pattern[];
}

/**
 * Generate tasks based on parent directory of each pattern.
 */
export function generate(patterns: Pattern[], options: IOptions): ITask[] {
	const unixPatterns = patterns.map(patternUtils.unixifyPattern);
	const unixIgnore = options.ignore.map(patternUtils.unixifyPattern);

	return convertPatternsToTasks(unixPatterns, unixIgnore, /* dynamic */ true);
}

/**
 * Convert patterns to tasks based on parent directory of each pattern.
 */
export function convertPatternsToTasks(patterns: Pattern[], ignore: Pattern[], dynamic: boolean): ITask[] {
	const positivePatterns = getPositivePatterns(patterns);
	const negativePatterns = getNegativePatternsAsPositive(patterns, ignore);

	const positivePatternsGroup = groupPatternsByBaseDirectory(positivePatterns);
	const negativePatternsGroup = groupPatternsByBaseDirectory(negativePatterns);

	// When we have a global group – there is no reason to divide the patterns into independent tasks.
	// In this case, the global task covers the rest.
	if ('.' in positivePatternsGroup) {
		const task = convertPatternGroupToTask('.', positivePatterns, negativePatterns, dynamic);

		return [task];
	}

	return convertPatternGroupsToTasks(positivePatternsGroup, negativePatternsGroup, dynamic);
}

/**
 * Return only positive patterns.
 */
export function getPositivePatterns(patterns: Pattern[]): Pattern[] {
	return patternUtils.getPositivePatterns(patterns);
}

/**
 * Retrun only negative patterns.
 */
export function getNegativePatternsAsPositive(patterns: Pattern[], ignore: Pattern[]): Pattern[] {
	const negative = patternUtils.getNegativePatterns(patterns);
	const positive = negative.map(patternUtils.convertToPositivePattern).concat(ignore);

	return positive.map(patternUtils.trimTrailingSlashGlobStar);
}

/**
 * Group patterns by base directory of each pattern.
 */
export function groupPatternsByBaseDirectory(patterns: Pattern[]): PatternsGroup {
	return patterns.reduce((collection, pattern) => {
		const base = patternUtils.getBaseDirectory(pattern);

		if (base in collection) {
			collection[base].push(pattern);
		} else {
			collection[base] = [pattern];
		}

		return collection;
	}, {} as PatternsGroup);
}

/**
 * Convert group of patterns to tasks.
 */
export function convertPatternGroupsToTasks(positive: PatternsGroup, negative: PatternsGroup, dynamic: boolean): ITask[] {
	const globalNegative = '.' in negative ? negative['.'] : [];

	return Object.keys(positive).map((base) => {
		const localNegative = base in negative ? negative[base] : [];
		const fullNegative = localNegative.concat(globalNegative);

		return convertPatternGroupToTask(base, positive[base], fullNegative, dynamic);
	});
}

/**
 * Create a task for positive and negative patterns.
 */
export function convertPatternGroupToTask(base: string, positive: Pattern[], negative: Pattern[], dynamic: boolean): ITask {
	return {
		base,
		dynamic,
		patterns: ([] as Pattern[]).concat(positive, negative.map(patternUtils.convertToNegativePattern)),
		positive,
		negative
	};
}
