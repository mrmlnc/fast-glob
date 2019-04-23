import Settings from '../settings';
import { Pattern, PatternsGroup } from '../types/index';
import * as patternUtils from '../utils/pattern';

export interface Task {
	base: string;
	dynamic: boolean;
	patterns: Pattern[];
	positive: Pattern[];
	negative: Pattern[];
}

/**
 * Generate tasks based on parent directory of each pattern.
 */
export function generate(patterns: Pattern[], settings: Settings): Task[] {
	const unixPatterns = patterns.map(patternUtils.unixifyPattern);
	const unixIgnore = settings.ignore.map(patternUtils.unixifyPattern);

	const positivePatterns = getPositivePatterns(unixPatterns);
	const negativePatterns = getNegativePatternsAsPositive(unixPatterns, unixIgnore);

	const staticPatterns = positivePatterns.filter(patternUtils.isStaticPattern);
	const dynamicPatterns = positivePatterns.filter(patternUtils.isDynamicPattern);

	const staticTasks = convertPatternsToTasks(staticPatterns, negativePatterns, /* dynamic */ false);
	const dynamicTasks = convertPatternsToTasks(dynamicPatterns, negativePatterns, /* dynamic */ true);

	return staticTasks.concat(dynamicTasks);
}

/**
 * Convert patterns to tasks based on parent directory of each pattern.
 */
export function convertPatternsToTasks(positive: Pattern[], negative: Pattern[], dynamic: boolean): Task[] {
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
export function convertPatternGroupsToTasks(positive: PatternsGroup, negative: Pattern[], dynamic: boolean): Task[] {
	return Object.keys(positive).map((base) => {
		return convertPatternGroupToTask(base, positive[base], negative, dynamic);
	});
}

/**
 * Create a task for positive and negative patterns.
 */
export function convertPatternGroupToTask(base: string, positive: Pattern[], negative: Pattern[], dynamic: boolean): Task {
	return {
		base,
		dynamic,
		positive,
		negative,
		patterns: ([] as Pattern[]).concat(positive, negative.map(patternUtils.convertToNegativePattern))
	};
}
