import * as taskManager from './managers/tasks';
import ProviderAsync from './providers/async';
import ProviderStream from './providers/stream';
import ProviderSync from './providers/sync';
import Settings from './settings';
import * as utils from './utils';

import type { Options as OptionsInternal } from './settings';
import type { Entry as EntryInternal, EntryItem, FileSystemAdapter as FileSystemAdapterInternal, Pattern as PatternInternal } from './types';
import type Provider from './providers/provider';

type EntryObjectModePredicate = { [TKey in keyof Pick<OptionsInternal, 'objectMode'>]-?: true };
type EntryStatsPredicate = { [TKey in keyof Pick<OptionsInternal, 'stats'>]-?: true };
type EntryObjectPredicate = EntryObjectModePredicate | EntryStatsPredicate;

function FastGlob(source: PatternInternal | PatternInternal[], options: EntryObjectPredicate & OptionsInternal): Promise<EntryInternal[]>;
function FastGlob(source: PatternInternal | PatternInternal[], options?: OptionsInternal): Promise<string[]>;
async function FastGlob(source: PatternInternal | PatternInternal[], options?: OptionsInternal): Promise<EntryItem[]> {
	assertPatternsInput(source);

	const works = getWorks(source, ProviderAsync, options);

	const result = await Promise.all(works);

	return utils.array.flatFirstLevel(result);
}

namespace FastGlob {
	export type Options = OptionsInternal;
	export type Entry = EntryInternal;
	export type Task = taskManager.Task;
	export type Pattern = PatternInternal;
	export type FileSystemAdapter = FileSystemAdapterInternal;

	export const glob = FastGlob;
	export const globSync = sync;
	export const globStream = stream;

	export const async = FastGlob;

	export function sync(source: PatternInternal | PatternInternal[], options: EntryObjectPredicate & OptionsInternal): EntryInternal[];
	export function sync(source: PatternInternal | PatternInternal[], options?: OptionsInternal): string[];
	export function sync(source: PatternInternal | PatternInternal[], options?: OptionsInternal): EntryItem[] {
		assertPatternsInput(source);

		const works = getWorks(source, ProviderSync, options);

		return utils.array.flatFirstLevel(works);
	}

	export function stream(source: PatternInternal | PatternInternal[], options?: OptionsInternal): NodeJS.ReadableStream {
		assertPatternsInput(source);

		const works = getWorks(source, ProviderStream, options);

		/**
		 * The stream returned by the provider cannot work with an asynchronous iterator.
		 * To support asynchronous iterators, regardless of the number of tasks, we always multiplex streams.
		 * This affects performance (+25%). I don't see best solution right now.
		 */
		return utils.stream.merge(works);
	}

	export function generateTasks(source: PatternInternal | PatternInternal[], options?: OptionsInternal): Task[] {
		assertPatternsInput(source);

		const patterns = ([] as PatternInternal[]).concat(source);
		const settings = new Settings(options);

		return taskManager.generate(patterns, settings);
	}

	export function isDynamicPattern(source: PatternInternal, options?: OptionsInternal): boolean {
		assertPatternsInput(source);

		const settings = new Settings(options);

		return utils.pattern.isDynamicPattern(source, settings);
	}

	export function escapePath(source: string): PatternInternal {
		assertPatternsInput(source);

		return utils.path.escape(source);
	}

	export function convertPathToPattern(source: string): PatternInternal {
		assertPatternsInput(source);

		return utils.path.convertPathToPattern(source);
	}

	export namespace posix {
		export function escapePath(source: string): PatternInternal {
			assertPatternsInput(source);

			return utils.path.escapePosixPath(source);
		}

		export function convertPathToPattern(source: string): PatternInternal {
			assertPatternsInput(source);

			return utils.path.convertPosixPathToPattern(source);
		}
	}

	export namespace win32 {
		export function escapePath(source: string): PatternInternal {
			assertPatternsInput(source);

			return utils.path.escapeWindowsPath(source);
		}

		export function convertPathToPattern(source: string): PatternInternal {
			assertPatternsInput(source);

			return utils.path.convertWindowsPathToPattern(source);
		}
	}
}

function getWorks<T>(source: PatternInternal | PatternInternal[], _Provider: new (settings: Settings) => Provider<T>, options?: OptionsInternal): T[] {
	const patterns = ([] as PatternInternal[]).concat(source);
	const settings = new Settings(options);

	const tasks = taskManager.generate(patterns, settings);
	const provider = new _Provider(settings);

	return tasks.map((task) => provider.read(task));
}

function assertPatternsInput(input: unknown): never | void {
	const source = ([] as unknown[]).concat(input);
	const isValidSource = source.every((item) => utils.string.isString(item) && !utils.string.isEmpty(item));

	if (!isValidSource) {
		throw new TypeError('Patterns must be a string (non empty) or an array of strings');
	}
}

export = FastGlob;
