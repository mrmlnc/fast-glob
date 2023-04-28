import * as path from 'path';

import * as fsStat from '@nodelib/fs.stat';

import * as utils from '../utils';

import type * as fs from 'fs';
import type Settings from '../settings';
import type { Entry, ErrnoException, Pattern, ReaderOptions } from '../types';


export default abstract class Reader<T> {
	protected readonly _fsStatSettings: fsStat.Settings = new fsStat.Settings({
		followSymbolicLink: this._settings.followSymbolicLinks,
		fs: this._settings.fs,
		throwErrorOnBrokenSymbolicLink: this._settings.followSymbolicLinks,
	});

	constructor(protected readonly _settings: Settings) { }

	public abstract dynamic(root: string, options: ReaderOptions): T;
	public abstract static(patterns: Pattern[], options: ReaderOptions): T;

	protected _getFullEntryPath(filepath: string): string {
		return path.resolve(this._settings.cwd, filepath);
	}

	protected _makeEntry(stats: fs.Stats, pattern: Pattern): Entry {
		const entry: Entry = {
			name: pattern,
			path: pattern,
			dirent: utils.fs.createDirentFromStats(pattern, stats),
		};

		if (this._settings.stats) {
			entry.stats = stats;
		}

		return entry;
	}

	protected _isFatalError(error: ErrnoException): boolean {
		return !utils.errno.isEnoentCodeError(error) && !this._settings.suppressErrors;
	}
}
