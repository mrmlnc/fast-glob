import * as taskManager from './managers/tasks';
import ProviderAsync from './providers/async';
import Provider from './providers/provider';
import ProviderStream from './providers/stream';
import ProviderSync from './providers/sync';
import Settings, { Options } from './settings';
import { Entry, EntryItem, Pattern } from './types/index';
import * as utils from './utils/index';

type Task = taskManager.Task;

type EntryObjectModePredicate = { [P in keyof Pick<Options, 'objectMode'>]-?: true };
type EntryStatsPredicate = { [P in keyof Pick<Options, 'stats'>]-?: true };
type EntryObjectPredicate = EntryObjectModePredicate | EntryStatsPredicate;

function sync(source: Pattern | Pattern[], options: Options & EntryObjectPredicate): Entry[];
function sync(source: Pattern | Pattern[], options?: Options): string[];
function sync(source: Pattern | Pattern[], options?: Options): EntryItem[] {
	assertPatternsInput(source);

	const works = getWorks(source, ProviderSync, options);

	return utils.array.flatten(works);
}

function async(source: Pattern | Pattern[], options: Options & EntryObjectPredicate): Promise<Entry[]>;
function async(source: Pattern | Pattern[], options?: Options): Promise<string[]>;
function async(source: Pattern | Pattern[], options?: Options): Promise<EntryItem[]> {
	try {
		assertPatternsInput(source);
	} catch (error) {
		return Promise.reject(error);
	}

	const works = getWorks(source, ProviderAsync, options);

	return Promise.all(works).then(utils.array.flatten);
}

function stream(source: Pattern | Pattern[], options?: Options): NodeJS.ReadableStream {
	assertPatternsInput(source);

	const works = getWorks(source, ProviderStream, options);

	/**
	 * The stream returned by the provider cannot work with an asynchronous iterator.
	 * To support asynchronous iterators, regardless of the number of tasks, we always multiplex streams.
	 * This affects performance (+25%). I don't see best solution right now.
	 */
	return utils.stream.merge(works);
}

function generateTasks(source: Pattern | Pattern[], options?: Options): Task[] {
	assertPatternsInput(source);

	const patterns = ([] as Pattern[]).concat(source);
	const settings = new Settings(options);

	return taskManager.generate(patterns, settings);
}

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
	Task,
	EntryItem
};
