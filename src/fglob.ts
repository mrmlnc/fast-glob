'use strict';

import { IEntry } from 'readdir-enhanced';

import * as task from './lib/task';
import * as readdir from './lib/readdir';

export interface IOptions {
	deep?: number | boolean;
	cwd?: string;
	stats?: boolean;
	ignore?: string | string[];
	onlyFiles?: boolean;
	onlyDirs?: boolean;
	transform?: (entry: string | IEntry) => any;
}

function assertPatternsInput(patterns: string[]) {
	if (!patterns.every((pattern) => typeof pattern === 'string')) {
		throw new TypeError('patterns must be a string or an array of strings');
	}
}

function prepareInput(source: string | string[], options?: IOptions) {
	const patterns: string[] = [].concat(source);
	assertPatternsInput(patterns);

	options = Object.assign(<IOptions>{
		cwd: process.cwd(),
		deep: true,
		stats: false,
		onlyFiles: false,
		onlyDirs: false,
		transform: null
	}, options);

	if (!options.cwd) {
		options.cwd = process.cwd();
	}
	if (!options.ignore) {
		options.ignore = [];
	} else if (options.ignore) {
		options.ignore = [].concat(options.ignore);
	}

	return {
		patterns,
		options
	};
}

export default function async(source: string | string[], options?: IOptions): Promise<(string | IEntry)[]> {
	const input = prepareInput(source, options);
	return Promise.all(task.generateTasks(input.patterns, input.options).map((task) => readdir.async(task, input.options)))
		.then((entries) => entries.reduce((res, to) => [].concat(res, to), []));
}

export function sync(source: string | string[], options?: IOptions): (string | IEntry)[] {
	const input = prepareInput(source, options);
	return task.generateTasks(input.patterns, input.options)
		.map((task) => readdir.sync(task, input.options))
		.reduce((res, to) => [].concat(res, to), []);
}
