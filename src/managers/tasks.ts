import * as objectUtils from '../utils/object';
import * as patternUtils from '../utils/pattern';

import { Pattern, PatternsGroup } from '../types/patterns';
import { IOptions } from './options';

export interface ITask {
	base: string;
	patterns: Pattern[];
	positive: Pattern[];
	negative: Pattern[];
}

export type TaskGroup = Record<string, ITask>;

/**
 * Returns grouped patterns by base directory of each pattern.
 */
export function groupPatternsByParentDirectory(patterns: Pattern[]): PatternsGroup {
	return patterns.reduce<PatternsGroup>((collection, pattern) => {
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
export function makePositiveTaskGroup(positive: PatternsGroup): TaskGroup {
	return Object.keys(positive).reduce<TaskGroup>((collection, base) => {
		const positivePatterns: Pattern[] = ([] as Pattern[]).concat(positive[base]);

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
export function makeNegativeTaskGroup(negative: PatternsGroup): TaskGroup {
	return Object.keys(negative).reduce<TaskGroup>((collection, base) => {
		const negativePatterns: Pattern[] = ([] as Pattern[]).concat(negative[base]);

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
export function mergeTaskGroups(positive: TaskGroup, negative: TaskGroup): TaskGroup {
	const group: TaskGroup = positive;

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
export function makeTasks(positive: PatternsGroup, negative: PatternsGroup): ITask[] {
	const positiveTaskGroup: TaskGroup = makePositiveTaskGroup(positive);
	const negativeTaskGroup: TaskGroup = makeNegativeTaskGroup(negative);

	const groups: TaskGroup = mergeTaskGroups(positiveTaskGroup, negativeTaskGroup);

	return objectUtils.values(groups);
}

/**
 * Generate tasks for provided patterns based on base directory of each pattern.
 */
export function generate(patterns: Pattern[], options: IOptions): ITask[] {
	const positive: Pattern[] = patternUtils.getPositivePatterns(patterns);
	if (positive.length === 0) {
		return [];
	}

	const ignore: Pattern[] = options.ignore;
	const negative: Pattern[] = patternUtils.getNegativePatterns(patterns)
		.map(patternUtils.convertToPositivePattern)
		.concat(ignore)
		.map(patternUtils.trimTrailingSlashGlobStar);

	const positiveGroup: PatternsGroup = groupPatternsByParentDirectory(positive);
	const negativeGroup: PatternsGroup = groupPatternsByParentDirectory(negative);

	// When we have a global group – there is no reason to divide the patterns into independent tasks because the first task covers the rest.
	if ('.' in positiveGroup) {
		const task: ITask = {
			base: '.',
			patterns: ([] as Pattern[]).concat(positive, negative.map(patternUtils.convertToNegativePattern)),
			positive,
			negative
		};

		return [task];
	}

	return makeTasks(positiveGroup, negativeGroup);
}
