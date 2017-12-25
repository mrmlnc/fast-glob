import globParent = require('glob-parent');

import { IOptions } from '../managers/options';
import { TPattern, TPatternsGroup } from '../types/patterns';

export interface ITask {
	base: string;
	patterns: TPattern[];
}

export function generateTasks(patterns: TPattern[], options: IOptions): ITask[] {
	const tasks: ITask[] = [];
	const parents: TPatternsGroup = {};

	const negativePatterns: TPattern[] = (<TPattern[]>options.ignore);

	// Compose patterns by common grounds
	patterns.forEach((pattern) => {
		if (pattern[0] === '!') {
			negativePatterns.push(pattern.slice(1));

			return;
		}

		const parent = globParent(pattern);
		if (parents.hasOwnProperty(parent)) {
			parents[parent].push(pattern);
		} else {
			parents[parent] = [pattern];
		}
	});

	// Expand negative patterns to exclude directories
	negativePatterns.forEach((pattern) => {
		if (pattern.endsWith('/**')) {
			negativePatterns.push(pattern.replace(/(\/\*\*)+$/, ''));
		}
	});

	Object.keys(parents).forEach((parent) => {
		const negative: TPattern[] = [];

		negativePatterns.forEach((pattern) => {
			let gPattern = pattern;
			if (parent === '.') {
				gPattern = '!' + pattern;
			} else {
				gPattern = pattern.startsWith(parent) ? '!' + pattern : `!${parent}/${pattern}`;
			}
			if (negative.indexOf(gPattern) === -1) {
				negative.push(gPattern);
			}
		});

		tasks.push({
			base: parent,
			patterns: ([] as TPattern[]).concat(parents[parent], negative)
		});
	});

	return tasks;
}
