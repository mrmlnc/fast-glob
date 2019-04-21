import * as taskManager from './managers/tasks';
import Reader from './providers/reader';
import ReaderAsync from './providers/reader-async';
import ReaderStream from './providers/reader-stream';
import ReaderSync from './providers/reader-sync';
import Settings, { Options, TransformFunction } from './settings';
import { EntryItem } from './types/entries';
import { Pattern } from './types/patterns';
import * as arrayUtils from './utils/array';
import * as streamUtils from './utils/stream';

type Task = taskManager.ITask;

/**
 * Synchronous API.
 */
function sync(source: Pattern | Pattern[], options?: Options): EntryItem[] {
	assertPatternsInput(source);

	const works = getWorks<EntryItem[]>(source, ReaderSync, options);

	return arrayUtils.flatten(works);
}

/**
 * Asynchronous API.
 */
function async(source: Pattern | Pattern[], options?: Options): Promise<EntryItem[]> {
	try {
		assertPatternsInput(source);
	} catch (error) {
		return Promise.reject(error);
	}

	const works = getWorks<Promise<EntryItem[]>>(source, ReaderAsync, options);

	return Promise.all(works).then(arrayUtils.flatten);
}

/**
 * Stream API.
 */
function stream(source: Pattern | Pattern[], options?: Options): NodeJS.ReadableStream {
	assertPatternsInput(source);

	const works = getWorks<NodeJS.ReadableStream>(source, ReaderStream, options);

	return streamUtils.merge(works);
}

/**
 * Return a set of tasks based on provided patterns.
 */
function generateTasks(source: Pattern | Pattern[], options?: Options): Task[] {
	assertPatternsInput(source);

	const patterns = ([] as Pattern[]).concat(source);
	const settings = new Settings(options);

	return taskManager.generate(patterns, settings);
}

/**
 * Returns a set of works based on provided tasks and class of the reader.
 */
function getWorks<T>(source: Pattern | Pattern[], _Reader: new (settings: Settings) => Reader<T>, options?: Options): T[] {
	const patterns = ([] as Pattern[]).concat(source);
	const settings = new Settings(options);

	const tasks = taskManager.generate(patterns, settings);
	const reader = new _Reader(settings);

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

	Options,
	Settings,
	TransformFunction,
	Task,
	EntryItem
};
