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

	const positivePatterns = getPositivePatterns(unixPatterns);
	const negativePatterns = getNegativePatternsAsPositive(unixPatterns, unixIgnore);

	/**
	 * When the `case` option is disabled, all patterns must be marked as dynamic, because we cannot check filepath
	 * directly (without read directory).
	 */
	const staticPatterns = !options.case ? [] : positivePatterns.filter(patternUtils.isStaticPattern);
	const dynamicPatterns = !options.case ? positivePatterns : positivePatterns.filter(patternUtils.isDynamicPattern);

	const staticTasks = convertPatternsToTasks(staticPatterns, negativePatterns, /* dynamic */ false);
	const dynamicTasks = convertPatternsToTasks(dynamicPatterns, negativePatterns, /* dynamic */ true);

	return staticTasks.concat(dynamicTasks);
}

/**
 * Convert patterns to tasks based on parent directory of each pattern.
 */
export function convertPatternsToTasks(positive: Pattern[], negative: Pattern[], dynamic: boolean): ITask[] {
	const positivePatternsGroup = groupPatternsByBaseDirectory(positive);

	// When we have a global group – there is no reason to divide the patterns into independent tasks.
	// In this case, the global task covers the rest.
	if ('.' in positivePatternsGroup) {
		const task = convertPatternGroupToTask('.', positive, negative, dynamic);

		return [task];
	}

	return convertPatternGroupsToTasks(positivePatternsGroup, negative, dynamic);
}

/**
 * Return only positive patterns.
 */
export function getPositivePatterns(patterns: Pattern[]): Pattern[] {
	return patternUtils.getPositivePatterns(patterns);
}

/**
 * Return only negative patterns.
 */
export function getNegativePatternsAsPositive(patterns: Pattern[], ignore: Pattern[]): Pattern[] {
	const negative = patternUtils.getNegativePatterns(patterns).concat(ignore);
	const positive = negative.map(patternUtils.convertToPositivePattern);

	return positive;
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
export function convertPatternGroupsToTasks(positive: PatternsGroup, negative: Pattern[], dynamic: boolean): ITask[] {
	return Object.keys(positive).map((base) => {
		return convertPatternGroupToTask(base, positive[base], negative, dynamic);
	});
}

/**
 * Create a task for positive and negative patterns.
 */
export function convertPatternGroupToTask(base: string, positive: Pattern[], negative: Pattern[], dynamic: boolean): ITask {
	return {
		base,
		dynamic,
		positive,
		negative,
		patterns: ([] as Pattern[]).concat(positive, negative.map(patternUtils.convertToNegativePattern))
	};
}
