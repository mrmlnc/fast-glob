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

export function getPositivePatterns(patterns: Pattern[]): Pattern[] {
	return utils.pattern.getPositivePatterns(patterns);
}

export function getNegativePatternsAsPositive(patterns: Pattern[], ignores: Pattern[]): Pattern[] {
	const re = /\/\*$/;
	const negative = utils.pattern.getNegativePatterns(patterns.filter((x) => re.exec(x) === null)).concat(ignores);

	for (const pattern of patterns.filter((x) => re.exec(x) !== null)) {
		for (const ignore of ignores) {
			negative.push(pattern.slice(0, Math.max(0, pattern.length - 1)) + ignore);
		}
	}

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
