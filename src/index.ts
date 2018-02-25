import merge2 = require('merge2');

import * as optionsManager from './managers/options';
import * as taskManager from './managers/tasks';

import Reader from './providers/reader';
import ReaderAsync from './providers/reader-async';
import ReaderStream from './providers/reader-stream';
import ReaderSync from './providers/reader-sync';

import * as arrayUtils from './utils/array';

import { IOptions, IPartialOptions } from './managers/options';
import { EntryItem } from './types/entries';
import { Pattern } from './types/patterns';

/**
 * Synchronous API.
 */
export function sync(source: Pattern | Pattern[], opts?: IPartialOptions): EntryItem[] {
	const works = getWorks<EntryItem[]>(source, ReaderSync, opts);

	return arrayUtils.flatten(works);
}

/**
 * Asynchronous API.
 */
export function async(source: Pattern | Pattern[], opts?: IPartialOptions): Promise<EntryItem[]> {
	const works = getWorks<Promise<EntryItem[]>>(source, ReaderAsync, opts);

	return Promise.all(works).then(arrayUtils.flatten);
}

/**
 * Stream API.
 */
export function stream(source: Pattern | Pattern[], opts?: IPartialOptions): NodeJS.ReadableStream {
	const works = getWorks<NodeJS.ReadableStream>(source, ReaderStream, opts);

	return merge2(works);
}

/**
 * Returns a set of works based on provided tasks and class of the reader.
 */
function getWorks<T>(source: Pattern | Pattern[], _Reader: new (options: IOptions) => Reader, opts?: IPartialOptions): T[] {
	const patterns = ([] as Pattern[]).concat(source);
	const options = optionsManager.prepare(opts);

	const tasks = taskManager.generate(patterns, options);
	const reader = new _Reader(options);

	return tasks.map(reader.read, reader);
}
