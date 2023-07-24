import * as taskManager from './managers/tasks';
import Settings from './settings';
import * as utils from './utils';
import { ProviderAsync, ProviderStream, ProviderSync } from './providers';
import { ReaderAsync, ReaderStream, ReaderSync } from './readers';

import type { Options as OptionsInternal } from './settings';
import type { Entry as EntryInternal, EntryItem, FileSystemAdapter as FileSystemAdapterInternal, Pattern as PatternInternal } from './types';

type EntryObjectModePredicate = { [TKey in keyof Pick<OptionsInternal, 'objectMode'>]-?: true };
type EntryStatsPredicate = { [TKey in keyof Pick<OptionsInternal, 'stats'>]-?: true };
type EntryObjectPredicate = EntryObjectModePredicate | EntryStatsPredicate;

type InputPattern = PatternInternal | readonly PatternInternal[];

function FastGlob(source: InputPattern, options: EntryObjectPredicate & OptionsInternal): Promise<EntryInternal[]>;
function FastGlob(source: InputPattern, options?: OptionsInternal): Promise<string[]>;
async function FastGlob(source: InputPattern, options?: OptionsInternal): Promise<EntryItem[]> {
	assertPatternsInput(source);

	const settings = new Settings(options);
	const reader = new ReaderAsync(settings);
	const provider = new ProviderAsync(reader, settings);

	const tasks = getTasks(source, settings);
	const promises = tasks.map((task) => provider.read(task));

	const result = await Promise.all(promises);

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

	export function sync(source: InputPattern, options: EntryObjectPredicate & OptionsInternal): EntryInternal[];
	export function sync(source: InputPattern, options?: OptionsInternal): string[];
	export function sync(source: InputPattern, options?: OptionsInternal): EntryItem[] {
		assertPatternsInput(source);

		const settings = new Settings(options);
		const reader = new ReaderSync(settings);
		const provider = new ProviderSync(reader, settings);

		const tasks = getTasks(source, settings);
		const entries = tasks.map((task) => provider.read(task));

		return utils.array.flatFirstLevel(entries);
	}

	export function stream(source: InputPattern, options?: OptionsInternal): NodeJS.ReadableStream {
		assertPatternsInput(source);

		const settings = new Settings(options);
		const reader = new ReaderStream(settings);
		const provider = new ProviderStream(reader, settings);

		const tasks = getTasks(source, settings);
		const streams = tasks.map((task) => provider.read(task));

		/**
		 * The stream returned by the provider cannot work with an asynchronous iterator.
		 * To support asynchronous iterators, regardless of the number of tasks, we always multiplex streams.
		 * This affects performance (+25%). I don't see best solution right now.
		 */
		return utils.stream.merge(streams);
	}

	export function generateTasks(source: InputPattern, options?: OptionsInternal): Task[] {
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

function getTasks(source: InputPattern, settings: Settings): taskManager.Task[] {
	const patterns = ([] as PatternInternal[]).concat(source);

	return taskManager.generate(patterns, settings);
}

function assertPatternsInput(input: unknown): never | void {
	const source = ([] as unknown[]).concat(input);
	const isValidSource = source.every((item) => utils.string.isString(item) && !utils.string.isEmpty(item));

	if (!isValidSource) {
		throw new TypeError('Patterns must be a string (non empty) or an array of strings');
	}
}

export = FastGlob;
