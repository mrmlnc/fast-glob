import * as optionsManager from './managers/options';
import * as taskManager from './managers/tasks';

import Reader from './providers/reader';
import ReaderAsync from './providers/reader-async';
import ReaderSync from './providers/reader-sync';

import { IOptions, IPartialOptions } from './managers/options';
import { TEntryItem } from './types/entries';
import { TPattern } from './types/patterns';

/**
 * Flatten nested arrays (max depth is 2) into a non-nested array of non-array items.
 */
export function flatten<T>(items: T[][]): T[] {
	return items.reduce((collection, item) => ([] as T[]).concat(collection, item), [] as T[]);
}

/**
 * Returns a set of works based on provided tasks and class of the reader.
 */
function getWorks<T>(source: TPattern | TPattern[], _Reader: new (options: IOptions) => Reader, opts?: IPartialOptions): T[] {
	const patterns = ([] as TPattern[]).concat(source);
	const options = optionsManager.prepare(opts);

	const tasks = taskManager.generate(patterns, options);
	const reader = new _Reader(options);

	return tasks.map(reader.read, reader);
}

/**
 * Synchronous API.
 */
export function sync(source: TPattern | TPattern[], opts?: IPartialOptions): TEntryItem[] {
	const works = getWorks<TEntryItem[]>(source, ReaderSync, opts);

	return flatten(works);
}

/**
 * Asynchronous API.
 */
export function async(source: TPattern | TPattern[], opts?: IPartialOptions): Promise<TEntryItem[]> {
	const works = getWorks<Promise<TEntryItem[]>>(source, ReaderAsync, opts);

	return Promise.all(works).then(flatten);
}
