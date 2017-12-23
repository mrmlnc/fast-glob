import * as readdir from './providers/readdir';
import * as task from './utils/task';

import { IEntry } from 'readdir-enhanced';
import { TEntryItem } from './types/entries';

export interface IOptions {
	deep: number | boolean;
	cwd: string;
	stats: boolean;
	ignore: string | string[];
	onlyFiles: boolean;
	onlyDirs: boolean;
	transform: <T>(entry: string | IEntry) => T;
}

export type IPartialOptions = Partial<IOptions>;

interface IInputAPI {
	patterns: string[];
	options: IOptions;
	api: typeof readdir;
}

function assertPatternsInput(patterns: string[]): void | never {
	if (!patterns.every((pattern) => typeof pattern === 'string')) {
		throw new TypeError('patterns must be a string or an array of strings');
	}
}

function prepareInput(source: string | string[], options?: IPartialOptions): IInputAPI {
	const patterns: string[] = ([] as string[]).concat(source);
	assertPatternsInput(patterns);

	const opts: IOptions = Object.assign({
		cwd: process.cwd(),
		deep: true,
		stats: false,
		onlyFiles: false,
		onlyDirs: false,
		transform: undefined
	}, options) as IOptions;

	if (!opts.cwd) {
		opts.cwd = process.cwd();
	}
	if (!opts.ignore) {
		opts.ignore = [];
	} else if (opts.ignore) {
		opts.ignore = ([] as string[]).concat(opts.ignore);
	}

	return {
		patterns,
		options: opts,
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
