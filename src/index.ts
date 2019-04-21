import * as optionsManager from './managers/options';
import * as taskManager from './managers/tasks';

import Reader from './providers/reader';
import ReaderAsync from './providers/reader-async';
import ReaderStream from './providers/reader-stream';
import ReaderSync from './providers/reader-sync';

import * as arrayUtils from './utils/array';
import * as streamUtils from './utils/stream';

import { EntryItem } from './types/entries';
import { Pattern } from './types/patterns';

type Options = optionsManager.IOptions;
type PartialOptions = optionsManager.IPartialOptions;
type TransformFunction<T> = optionsManager.TransformFunction<T>;
type Task = taskManager.ITask;

/**
 * Synchronous API.
 */
function sync(source: Pattern | Pattern[], opts?: PartialOptions): EntryItem[] {
	assertPatternsInput(source);

	const works = getWorks<EntryItem[]>(source, ReaderSync, opts);

	return arrayUtils.flatten(works);
}

/**
 * Asynchronous API.
 */
function async(source: Pattern | Pattern[], opts?: PartialOptions): Promise<EntryItem[]> {
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
function stream(source: Pattern | Pattern[], opts?: PartialOptions): NodeJS.ReadableStream {
	assertPatternsInput(source);

	const works = getWorks<NodeJS.ReadableStream>(source, ReaderStream, opts);

	return streamUtils.merge(works);
}

/**
 * Return a set of tasks based on provided patterns.
 */
function generateTasks(source: Pattern | Pattern[], opts?: PartialOptions): Task[] {
	assertPatternsInput(source);

	const patterns = ([] as Pattern[]).concat(source);
	const options = optionsManager.prepare(opts);

	return taskManager.generate(patterns, options);
}

/**
 * Returns a set of works based on provided tasks and class of the reader.
 */
function getWorks<T>(source: Pattern | Pattern[], _Reader: new (options: Options) => Reader<T>, opts?: PartialOptions): T[] {
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

export default async;
export {
	async,
	sync,
	stream,
	generateTasks,

	PartialOptions as Options,
	TransformFunction,
	Task,
	EntryItem
};
