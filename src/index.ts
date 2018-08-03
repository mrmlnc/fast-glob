import merge2 = require('merge2');

import * as optionsManager from './managers/options';
import * as taskManager from './managers/tasks';

import Reader from './providers/reader';
import ReaderAsync from './providers/reader-async';
import ReaderStream from './providers/reader-stream';
import ReaderSync from './providers/reader-sync';

import * as arrayUtils from './utils/array';

import { IOptions, IPartialOptions } from './managers/options';
import { ITask } from './managers/tasks';
import { EntryItem } from './types/entries';
import { Pattern } from './types/patterns';

/**
 * Synchronous API.
 */
export function sync(
	source: Pattern | Pattern[],
	opts?: IPartialOptions,
	_Reader: new (options: IOptions) => Reader<EntryItem[]> = ReaderSync
): EntryItem[] {
	const works = getWorks<EntryItem[]>(source, _Reader, opts);

	return arrayUtils.flatten(works);
}

/**
 * Asynchronous API.
 */
export function async(
	source: Pattern | Pattern[],
	opts?: IPartialOptions,
	_Reader: new (options: IOptions) => Reader<Promise<EntryItem[]>> = ReaderAsync
): Promise<EntryItem[]> {
	const works = getWorks<Promise<EntryItem[]>>(source, _Reader, opts);

	return Promise.all(works).then(arrayUtils.flatten);
}

/**
 * Stream API.
 */
export function stream(
	source: Pattern | Pattern[],
	opts?: IPartialOptions,
	_Reader: new (options: IOptions) => Reader<NodeJS.ReadableStream> = ReaderStream
): NodeJS.ReadableStream {
	const works = getWorks<NodeJS.ReadableStream>(source, _Reader, opts);

	return merge2(works);
}

/**
 * Return a set of tasks based on provided patterns.
 */
export function generateTasks(source: Pattern | Pattern[], opts?: IPartialOptions): ITask[] {
	const patterns = ([] as Pattern[]).concat(source);
	const options = optionsManager.prepare(opts);

	return taskManager.generate(patterns, options);
}

/**
 * Returns a set of works based on provided tasks and class of the reader.
 */
function getWorks<T>(source: Pattern | Pattern[], _Reader: new (options: IOptions) => Reader<T>, opts?: IPartialOptions): T[] {
	const patterns = ([] as Pattern[]).concat(source);
	const options = optionsManager.prepare(opts);

	const tasks = taskManager.generate(patterns, options);
	const reader = new _Reader(options);

	return tasks.map(reader.read, reader);
}
