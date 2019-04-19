import * as optionsManager from './managers/options';
import * as taskManager from './managers/tasks';

import Reader from './providers/reader';
import ReaderAsync from './providers/reader-async';
import ReaderStream from './providers/reader-stream';
import ReaderSync from './providers/reader-sync';

import * as arrayUtils from './utils/array';
import * as streamUtils from './utils/stream';

import { IOptions, IPartialOptions } from './managers/options';
import { ITask } from './managers/tasks';
import { EntryItem } from './types/entries';
import { Pattern } from './types/patterns';

/**
 * Synchronous API.
 */
export function sync(source: Pattern | Pattern[], opts?: IPartialOptions): EntryItem[] {
	assertPatternsInput(source);

	const works = getWorks<EntryItem[]>(source, ReaderSync, opts);

	return arrayUtils.flatten(works);
}

/**
 * Asynchronous API.
 */
export function async(source: Pattern | Pattern[], opts?: IPartialOptions): Promise<EntryItem[]> {
	try {
		assertPatternsInput(source);
	} catch (error) {
		return Promise.reject(error);
	}

	const works = getWorks<Promise<EntryItem[]>>(source, ReaderAsync, opts);

	return Promise.all(works).then(arrayUtils.flatten);
}

/**
 * Stream API.
 */
export function stream(source: Pattern | Pattern[], opts?: IPartialOptions): NodeJS.ReadableStream {
	assertPatternsInput(source);

	const works = getWorks<NodeJS.ReadableStream>(source, ReaderStream, opts);

	return streamUtils.merge(works);
}

/**
 * Return a set of tasks based on provided patterns.
 */
export function generateTasks(source: Pattern | Pattern[], opts?: IPartialOptions): ITask[] {
	assertPatternsInput(source);

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

function assertPatternsInput(source: unknown): void | never {
	if (([] as unknown[]).concat(source).every(isString)) {
		return;
	}

	throw new TypeError('Patterns must be a string or an array of strings');
}

function isString(source: unknown): source is string {
	/* tslint:disable-next-line strict-type-predicates */
	return typeof source === 'string';
}
