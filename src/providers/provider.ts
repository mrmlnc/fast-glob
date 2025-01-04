import * as path from 'node:path';

import DeepFilter from './filters/deep';
import EntryFilter from './filters/entry';
import ErrorFilter from './filters/error';
import EntryTransformer from './transformers/entry';

import type Settings from '../settings';
import type { MicromatchOptions, ReaderOptions } from '../types';
import type { Task } from '../managers/tasks';

export abstract class Provider<T> {
	public readonly errorFilter: ErrorFilter;
	public readonly entryFilter: EntryFilter;
	public readonly deepFilter: DeepFilter;
	public readonly entryTransformer: EntryTransformer;

	readonly #settings: Settings;

	constructor(settings: Settings) {
		this.#settings = settings;

		const micromatchOptions = this._getMicromatchOptions();

		this.errorFilter = new ErrorFilter(settings);
		this.entryFilter = new EntryFilter(settings, micromatchOptions);
		this.deepFilter = new DeepFilter(settings, micromatchOptions);
		this.entryTransformer = new EntryTransformer(settings);
	}

	public abstract read(_task: Task): T;

	protected _getRootDirectory(task: Task): string {
		return path.resolve(this.#settings.cwd, task.base);
	}

	protected _getReaderOptions(task: Task): ReaderOptions {
		const basePath = task.base === '.' ? '' : task.base;

		return {
			basePath,
			pathSegmentSeparator: '/',
			deepFilter: this.deepFilter.getFilter(basePath, task.positive, task.negative),
			entryFilter: this.entryFilter.getFilter(task.positive, task.negative),
			errorFilter: this.errorFilter.getFilter(),
			followSymbolicLinks: this.#settings.followSymbolicLinks,
			fs: this.#settings.fs,
			stats: this.#settings.stats,
			throwErrorOnBrokenSymbolicLink: this.#settings.throwErrorOnBrokenSymbolicLink,
			transform: this.entryTransformer.getTransformer(),
			signal: this.#settings.signal,
		};
	}

	protected _getMicromatchOptions(): MicromatchOptions {
		return {
			dot: this.#settings.dot,
			matchBase: this.#settings.baseNameMatch,
			nobrace: !this.#settings.braceExpansion,
			nocase: !this.#settings.caseSensitiveMatch,
			noext: !this.#settings.extglob,
			noglobstar: !this.#settings.globstar,
			posix: true,
			strictSlashes: false,
		};
	}
}
