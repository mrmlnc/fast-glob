import * as taskManager from './managers/tasks';
import ProviderAsync from './providers/async';
import Provider from './providers/provider';
import ProviderStream from './providers/stream';
import ProviderSync from './providers/sync';
import Settings, { Options, TransformFunction } from './settings';
import { EntryItem, Pattern } from './types/index';
import * as utils from './utils/index';

type Task = taskManager.Task;

/**
 * Synchronous API.
 */
function sync(source: Pattern | Pattern[], options?: Options): EntryItem[] {
	assertPatternsInput(source);

	const works = getWorks<EntryItem[]>(source, ProviderSync, options);

	return utils.array.flatten(works);
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

	const works = getWorks<Promise<EntryItem[]>>(source, ProviderAsync, options);

	return Promise.all(works).then(utils.array.flatten);
}

/**
 * Stream API.
 */
function stream(source: Pattern | Pattern[], options?: Options): NodeJS.ReadableStream {
	assertPatternsInput(source);

	const works = getWorks<NodeJS.ReadableStream>(source, ProviderStream, options);

	return utils.stream.merge(works);
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
 * Returns a set of works based on provided tasks and class of the provider.
 */
function getWorks<T>(source: Pattern | Pattern[], _Provider: new (settings: Settings) => Provider<T>, options?: Options): T[] {
	const patterns = ([] as Pattern[]).concat(source);
	const settings = new Settings(options);

	const tasks = taskManager.generate(patterns, settings);
	const provider = new _Provider(settings);

	return tasks.map(provider.read, provider);
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
