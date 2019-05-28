import * as path from 'path';

import { Task } from '../managers/tasks';
import Settings from '../settings';
import { MicromatchOptions, ReaderOptions } from '../types/index';
import DeepFilter from './filters/deep';
import EntryFilter from './filters/entry';
import ErrorFilter from './filters/error';
import EntryTransformer from './transformers/entry';

export default abstract class Provider<T> {
	public readonly errorFilter: ErrorFilter;
	public readonly entryFilter: EntryFilter;
	public readonly deepFilter: DeepFilter;
	public readonly entryTransformer: EntryTransformer;

	private readonly _micromatchOptions: MicromatchOptions;

	constructor(protected readonly _settings: Settings) {
		this._micromatchOptions = this.getMicromatchOptions();

		this.errorFilter = new ErrorFilter(_settings);
		this.entryFilter = new EntryFilter(_settings, this._micromatchOptions);
		this.deepFilter = new DeepFilter(_settings, this._micromatchOptions);
		this.entryTransformer = new EntryTransformer(_settings);
	}

	/**
	 * The main logic of reading the directories that must be implemented by each providers.
	 */
	public abstract read(_task: Task): T;

	/**
	 * Returns root path to scanner.
	 */
	public getRootDirectory(task: Task): string {
		return path.resolve(this._settings.cwd, task.base);
	}

	/**
	 * Returns options for reader.
	 */
	public getReaderOptions(task: Task): ReaderOptions {
		const basePath = task.base === '.' ? '' : task.base;

		return {
			basePath,
			concurrency: this._settings.concurrency,
			deepFilter: this.deepFilter.getFilter(basePath, task.positive, task.negative),
			entryFilter: this.entryFilter.getFilter(task.positive, task.negative),
			errorFilter: this.errorFilter.getFilter(),
			followSymbolicLinks: this._settings.followSymbolicLinks,
			fs: this._settings.fs,
			throwErrorOnBrokenSymbolicLink: this._settings.throwErrorOnBrokenSymbolicLink,
			transform: this.entryTransformer.getTransformer()
		};
	}

	/**
	 * Returns options for micromatch.
	 */
	public getMicromatchOptions(): MicromatchOptions {
		return {
			dot: this._settings.dot,
			nobrace: !this._settings.braceExpansion,
			noglobstar: !this._settings.globstar,
			noext: !this._settings.extglob,
			nocase: !this._settings.caseSensitiveMatch,
			matchBase: this._settings.matchBase
		};
	}
}
