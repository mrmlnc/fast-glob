import * as path from 'path';

import DeepFilter from './filters/deep';
import EntryFilter from './filters/entry';
import ErrorFilter from './filters/error';
import EntryTransformer from './transformers/entry';

import type { MicromatchOptions, ReaderOptions } from '../types';
import type Settings from '../settings';
import type { Task } from '../managers/tasks';

export default abstract class Provider<T> {
	public readonly errorFilter: ErrorFilter = new ErrorFilter(this._settings);
	public readonly entryFilter: EntryFilter = new EntryFilter(this._settings, this._getMicromatchOptions());
	public readonly deepFilter: DeepFilter = new DeepFilter(this._settings, this._getMicromatchOptions());
	public readonly entryTransformer: EntryTransformer = new EntryTransformer(this._settings);

	constructor(protected readonly _settings: Settings) {}

	public abstract read(_task: Task): T;

	protected _getRootDirectory(task: Task): string {
		return path.resolve(this._settings.cwd, task.base);
	}

	protected _getReaderOptions(task: Task): ReaderOptions {
		const basePath = task.base === '.' ? '' : task.base;

		return {
			basePath,
			pathSegmentSeparator: '/',
			concurrency: this._settings.concurrency,
			deepFilter: this.deepFilter.getFilter(basePath, task.positive, task.negative),
			entryFilter: this.entryFilter.getFilter(task.positive, task.negative),
			errorFilter: this.errorFilter.getFilter(),
			followSymbolicLinks: this._settings.followSymbolicLinks,
			fs: this._settings.fs,
			stats: this._settings.stats,
			throwErrorOnBrokenSymbolicLink: this._settings.throwErrorOnBrokenSymbolicLink,
			transform: this.entryTransformer.getTransformer(),
		};
	}

	protected _getMicromatchOptions(): MicromatchOptions {
		return {
			dot: this._settings.dot,
			matchBase: this._settings.baseNameMatch,
			nobrace: !this._settings.braceExpansion,
			nocase: !this._settings.caseSensitiveMatch,
			noext: !this._settings.extglob,
			noglobstar: !this._settings.globstar,
			posix: true,
			strictSlashes: false,
		};
	}
}
