'use strict';

import { IEntry } from 'readdir-enhanced';

import * as task from './lib/task';
import * as readdir from './lib/readdir';
import * as bash from './lib/bash';

export interface IOptions {
	deep?: number | boolean;
	cwd?: string;
	stats?: boolean;
	ignore?: string | string[];
	onlyFiles?: boolean;
	onlyDirs?: boolean;
	useBashFor?: string[];
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
		useBashFor: ['darwin', 'linux'],
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
		options,
		api: (options.useBashFor.indexOf(process.platform) === -1) ? readdir : bash as any
	};
}

export default function async(source: string | string[], options?: IOptions): Promise<(string | IEntry)[]> {
	const input = prepareInput(source, options);

	return Promise.all(task.generateTasks(input.patterns, input.options).map((task) => input.api.async(task, input.options)))
		.then((entries) => entries.reduce((res, to) => [].concat(res, to), []));
}

export function sync(source: string | string[], options?: IOptions): (string | IEntry)[] {
	const input = prepareInput(source, options);

	return task.generateTasks(input.patterns, input.options)
		.map((task) => input.api.sync(task, input.options))
		.reduce((res, to) => [].concat(res, to), []);
}
