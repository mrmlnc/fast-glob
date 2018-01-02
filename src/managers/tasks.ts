import * as objectUtils from '../utils/object';
import * as patternUtils from '../utils/pattern';

import { TPattern, TPatternsGroup } from '../types/patterns';
import { IOptions } from './options';

export interface ITask {
	base: string;
	patterns: TPattern[];
	positive: TPattern[];
	negative: TPattern[];
}

export type TTaskGroup = Record<string, ITask>;

/**
 * Returns grouped patterns by base directory of each pattern.
 */
export function groupPatternsByParentDirectory(patterns: TPattern[]): TPatternsGroup {
	return patterns.reduce<TPatternsGroup>((collection, pattern) => {
		const parent: string = patternUtils.getBaseDirectory(pattern);

		if (!collection[parent]) {
			collection[parent] = [];
		}

		collection[parent].push(pattern);

		return collection;
	}, {});
}

/**
 * Convert positive patterns to tasks.
 */
export function makePositiveTaskGroup(positive: TPatternsGroup): TTaskGroup {
	return Object.keys(positive).reduce<TTaskGroup>((collection, base) => {
		const positivePatterns: TPattern[] = ([] as TPattern[]).concat(positive[base]);

		collection[base] = {
			base,
			patterns: positivePatterns,
			positive: positivePatterns,
			negative: []
		};

		return collection;
	}, {});
}

/**
 * Convert negative patterns to tasks.
 */
export function makeNegativeTaskGroup(negative: TPatternsGroup): TTaskGroup {
	return Object.keys(negative).reduce<TTaskGroup>((collection, base) => {
		const negativePatterns: TPattern[] = ([] as TPattern[]).concat(negative[base]);

		collection[base] = {
			base,
			patterns: negativePatterns.map(patternUtils.convertToNegativePattern),
			positive: [],
			negative: negativePatterns
		};

		return collection;
	}, {});
}

/**
 * Returns merged positive and negative task groups.
 *
 * Just two rules:
 *   - If a positive task group has a pair in the negative group, then merge it.
 *   - If a negative task group has a global base task, then merge them to full positive group.
 */
export function mergeTaskGroups(positive: TTaskGroup, negative: TTaskGroup): TTaskGroup {
	const group: TTaskGroup = positive;

	const globalNegativePatterns = '.' in negative ? negative['.'].negative : [];

	Object.keys(group).forEach((base) => {
		if (base in negative) {
			group[base].patterns = group[base].patterns.concat(negative[base].negative.map(patternUtils.convertToNegativePattern));
			group[base].negative = group[base].negative.concat(negative[base].negative);
		}

		if (globalNegativePatterns.length !== 0) {
			group[base].patterns = group[base].patterns.concat(globalNegativePatterns.map(patternUtils.convertToNegativePattern));
			group[base].negative = group[base].negative.concat(globalNegativePatterns);
		}
	});

	return group;
}

/**
 * Returns builded tasks for provided patterns groups.
 */
export function makeTasks(positive: TPatternsGroup, negative: TPatternsGroup): ITask[] {
	const positiveTaskGroup: TTaskGroup = makePositiveTaskGroup(positive);
	const negativeTaskGroup: TTaskGroup = makeNegativeTaskGroup(negative);

	const groups: TTaskGroup = mergeTaskGroups(positiveTaskGroup, negativeTaskGroup);

	return objectUtils.values(groups);
}

/**
 * Generate tasks for provided patterns based on base directory of each pattern.
 */
export function generate(patterns: TPattern[], options: IOptions): ITask[] {
	const positive: TPattern[] = patternUtils.getPositivePatterns(patterns);
	if (positive.length === 0) {
		return [];
	}

	const ignore: TPattern[] = options.ignore as TPattern[];
	const negative: TPattern[] = patternUtils.getNegativePatterns(patterns).map(patternUtils.convertToPositivePattern).concat(ignore);

	const positiveGroup: TPatternsGroup = groupPatternsByParentDirectory(positive);
	const negativeGroup: TPatternsGroup = groupPatternsByParentDirectory(negative);

	// When we have a global group – there is no reason to divide the patterns into independent tasks because the first task covers the rest.
	if ('.' in positiveGroup) {
		const task: ITask = {
			base: '.',
			patterns: ([] as TPattern[]).concat(positive, negative.map(patternUtils.convertToNegativePattern)),
			positive,
			negative
		};

		return [task];
	}

	return makeTasks(positiveGroup, negativeGroup);
}
