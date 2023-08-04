import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';

import { Reader } from './reader';

import type { Entry, ErrnoException, FsStats, Pattern, ReaderOptions } from '../types';

export interface IReaderSync {
	dynamic: (root: string, options: ReaderOptions) => Entry[];
	static: (patterns: Pattern[], options: ReaderOptions) => Entry[];
}

export class ReaderSync extends Reader<Entry[]> implements IReaderSync {
	protected _walkSync: typeof fsWalk.walkSync = fsWalk.walkSync;
	protected _statSync: typeof fsStat.statSync = fsStat.statSync;

	public dynamic(root: string, options: ReaderOptions): Entry[] {
		return this._walkSync(root, options);
	}

	public static(patterns: Pattern[], options: ReaderOptions): Entry[] {
		const entries: Entry[] = [];

		for (const pattern of patterns) {
			const filepath = this._getFullEntryPath(pattern);
			const entry = this.#getEntry(filepath, pattern, options);

			if (entry === null || !options.entryFilter(entry)) {
				continue;
			}

			entries.push(entry);
		}

		return entries;
	}

	#getEntry(filepath: string, pattern: Pattern, options: ReaderOptions): Entry | null {
		try {
			const stats = this.#getStat(filepath);

			return this._makeEntry(stats, pattern);
		} catch (error) {
			if (options.errorFilter(error as ErrnoException)) {
				return null;
			}

			throw error;
		}
	}

	#getStat(filepath: string): FsStats {
		return this._statSync(filepath, this._fsStatSettings);
	}
}
