import Settings from '../settings';
import { Pattern, PatternsGroup } from '../types';
import * as utils from '../utils';

export type Task = {
	base: string;
	dynamic: boolean;
	patterns: Pattern[];
	positive: Pattern[];
	negative: Pattern[];
};

export function generate(patterns: Pattern[], settings: Settings): Task[] {
	const positivePatterns = getPositivePatterns(patterns);
	const negativePatterns = getNegativePatternsAsPositive(patterns, settings.ignore);

	const staticPatterns = positivePatterns.filter((pattern) => utils.pattern.isStaticPattern(pattern, settings));
	const dynamicPatterns = positivePatterns.filter((pattern) => utils.pattern.isDynamicPattern(pattern, settings));

	const staticTasks = convertPatternsToTasks(staticPatterns, negativePatterns, /* dynamic */ false);
	const dynamicTasks = convertPatternsToTasks(dynamicPatterns, negativePatterns, /* dynamic */ true);

	return staticTasks.concat(dynamicTasks);
}

/**
 * Returns tasks grouped by basic pattern directories.
 *
 * Patterns that can be found inside (`./`) and outside (`../`) the current directory are handled separately.
 * This is necessary because directory traversal starts at the base directory and goes deeper.
 */
export function convertPatternsToTasks(positive: Pattern[], negative: Pattern[], dynamic: boolean): Task[] {
	const tasks: Task[] = [];

	const patternsOutsideCurrentDirectory = utils.pattern.getPatternsOutsideCurrentDirectory(positive);
	const patternsInsideCurrentDirectory = utils.pattern.getPatternsInsideCurrentDirectory(positive);

	const outsideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsOutsideCurrentDirectory);
	const insideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsInsideCurrentDirectory);

	tasks.push(...convertPatternGroupsToTasks(outsideCurrentDirectoryGroup, [], dynamic));

	/*
	 * For the sake of reducing future accesses to the file system, we merge all tasks within the current directory
	 * into a global task, if at least one pattern refers to the root (`.`). In this case, the global task covers the rest.
	 */
	if ('.' in insideCurrentDirectoryGroup) {
		tasks.push(convertPatternGroupToTask('.', patternsInsideCurrentDirectory, negative, dynamic));
	} else {
		tasks.push(...convertPatternGroupsToTasks(insideCurrentDirectoryGroup, negative, dynamic));
	}

	return tasks;
}

export function getPositivePatterns(patterns: Pattern[]): Pattern[] {
	return utils.pattern.getPositivePatterns(patterns);
}

export function getNegativePatternsAsPositive(patterns: Pattern[], ignore: Pattern[]): Pattern[] {
	const negative = utils.pattern.getNegativePatterns(patterns).concat(ignore);
	const positive = negative.map(utils.pattern.convertToPositivePattern);

	return positive;
}

export function groupPatternsByBaseDirectory(patterns: Pattern[]): PatternsGroup {
	const group: PatternsGroup = {};

	return patterns.reduce((collection, pattern) => {
		const base = utils.pattern.getBaseDirectory(pattern);

		if (base in collection) {
			collection[base].push(pattern);
		} else {
			collection[base] = [pattern];
		}

		return collection;
	}, group);
}

export function convertPatternGroupsToTasks(positive: PatternsGroup, negative: Pattern[], dynamic: boolean): Task[] {
	return Object.keys(positive).map((base) => {
		return convertPatternGroupToTask(base, positive[base], negative, dynamic);
	});
}

export function convertPatternGroupToTask(base: string, positive: Pattern[], negative: Pattern[], dynamic: boolean): Task {
	return {
		dynamic,
		positive,
		negative,
		base,
		patterns: ([] as Pattern[]).concat(positive, negative.map(utils.pattern.convertToNegativePattern))
	};
}
