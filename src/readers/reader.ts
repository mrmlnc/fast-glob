import * as path from 'node:path';

import * as fsStat from '@nodelib/fs.stat';

import * as utils from '../utils';

import type Settings from '../settings';
import type { Entry, ErrnoException, FsStats, Pattern, ReaderOptions } from '../types';

export abstract class Reader<T> {
	protected readonly _fsStatSettings: fsStat.Settings;

	readonly #settings: Settings;

	constructor(settings: Settings) {
		this.#settings = settings;

		this._fsStatSettings = new fsStat.Settings({
			followSymbolicLink: settings.followSymbolicLinks,
			fs: settings.fs,
			throwErrorOnBrokenSymbolicLink: settings.throwErrorOnBrokenSymbolicLink,
		});
	}

	public abstract dynamic(root: string, options: ReaderOptions): T;
	public abstract static(patterns: Pattern[], options: ReaderOptions): T;

	protected _getFullEntryPath(filepath: string): string {
		return path.resolve(this.#settings.cwd, filepath);
	}

	protected _makeEntry(stats: FsStats, pattern: Pattern): Entry {
		const entry: Entry = {
			name: pattern,
			path: pattern,
			dirent: utils.fs.createDirentFromStats(pattern, stats),
		};

		if (this.#settings.stats) {
			entry.stats = stats;
		}

		return entry;
	}

	protected _isFatalError(error: ErrnoException): boolean {
		return !utils.errno.isEnoentCodeError(error) && !this.#settings.suppressErrors;
	}
}
