import * as fs from 'fs';

import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';

import { Entry, ErrnoException, Pattern, ReaderOptions } from '../types/index';
import Reader from './reader';

export default class ReaderSync extends Reader<Entry[]> {
	protected _walkSync: typeof fsWalk.walkSync = fsWalk.walkSync;
	protected _statSync: typeof fsStat.statSync = fsStat.statSync;

	public dynamic(root: string, options: ReaderOptions): Entry[] {
		try {
			return this._walkSync(root, options);
		} catch (error) {
			if (this._isFatalError(error as ErrnoException)) {
				throw error;
			}

			return [];
		}
	}

	public static(patterns: Pattern[], options: ReaderOptions): Entry[] {
		const entries: Entry[] = [];

		for (const pattern of patterns) {
			const filepath = this._getFullEntryPath(pattern);
			const entry = this._getEntry(filepath, pattern);

			if (entry === null || !options.entryFilter(entry)) {
				continue;
			}

			entries.push(entry);
		}

		return entries;
	}

	private _getEntry(filepath: string, pattern: Pattern): Entry | null {
		try {
			const stats = this._getStat(filepath);

			return this._makeEntry(stats, pattern);
		} catch (error) {
			if (this._isFatalError(error as ErrnoException)) {
				throw error;
			}

			return null;
		}
	}

	private _getStat(filepath: string): fs.Stats {
		return this._statSync(filepath, this._fsStatSettings);
	}
}
