import * as task from './utils/task';
import * as readdir from './providers/readdir';

import { IEntry } from 'readdir-enhanced';
import { TEntryItem } from './types/entries';

export interface IOptions {
	deep?: number | boolean;
	cwd?: string;
	stats?: boolean;
	ignore?: string | string[];
	onlyFiles?: boolean;
	onlyDirs?: boolean;
	transform?: null | ((entry: string | IEntry) => any);
}

function assertPatternsInput(patterns: string[]) {
	if (!patterns.every((pattern) => typeof pattern === 'string')) {
		throw new TypeError('patterns must be a string or an array of strings');
	}
}

function prepareInput(source: string | string[], options?: IOptions) {
	const patterns: string[] = ([] as string[]).concat(source);
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
		options.ignore = ([] as string[]).concat(options.ignore);
	}

	return {
		patterns,
		options,
		api: readdir
	};
}

export default function async(source: string | string[], options?: IOptions): Promise<TEntryItem[]> {
	const input = prepareInput(source, options);

	return Promise.all(task.generateTasks(input.patterns, input.options).map((work) => input.api.async(work, input.options)))
		.then((entries) => entries.reduce((res, to) => ([] as TEntryItem[]).concat(res, to), []));
}

export function sync(source: string | string[], options?: IOptions): TEntryItem[] {
	const input = prepareInput(source, options);

	return task.generateTasks(input.patterns, input.options)
		.map((work) => input.api.sync(work, input.options))
		.reduce((res, to) => ([] as TEntryItem[]).concat(res, to), []);
}
