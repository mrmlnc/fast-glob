import type * as fs from 'fs';

import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';

import type { Entry, ErrnoException, Pattern, ReaderOptions } from '../types';
import Reader from './reader';

export default class ReaderSync extends Reader<Entry[]> {
	protected _walkSync: typeof fsWalk.walkSync = fsWalk.walkSync;
	protected _statSync: typeof fsStat.statSync = fsStat.statSync;

	public dynamic(root: string, options: ReaderOptions): Entry[] {
		return this._walkSync(root, options);
	}

	public static(patterns: Pattern[], options: ReaderOptions): Entry[] {
		const entries: Entry[] = [];

		for (const pattern of patterns) {
			const filepath = this._getFullEntryPath(pattern);
			const entry = this._getEntry(filepath, pattern, options);

			if (entry === null || !options.entryFilter(entry)) {
				continue;
			}

			entries.push(entry);
		}

		return entries;
	}

	private _getEntry(filepath: string, pattern: Pattern, options: ReaderOptions): Entry | null {
		try {
			const stats = this._getStat(filepath);

			return this._makeEntry(stats, pattern);
		} catch (error) {
			if (options.errorFilter(error as ErrnoException)) {
				return null;
			}

			throw error;
		}
	}

	private _getStat(filepath: string): fs.Stats {
		return this._statSync(filepath, this._fsStatSettings);
	}
}
