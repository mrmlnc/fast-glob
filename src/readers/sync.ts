import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';
import type {
	Entry,
	ErrnoException,
	FsStats,
	Pattern,
	ReaderOptions,
} from '../types/index.js';
import { Reader } from './reader.js';

export type ReaderSyncInterface = {
	dynamic: (root: string, options: ReaderOptions) => Entry[];
	static: (patterns: Pattern[], options: ReaderOptions) => Entry[];
};

export class ReaderSync extends Reader<Entry[]> implements ReaderSyncInterface {
	protected _walkSync: typeof fsWalk.walkSync = fsWalk.walkSync;
	protected _statSync: typeof fsStat.statSync = fsStat.statSync;

	#getEntry(filepath: string, pattern: Pattern, options: ReaderOptions): Entry | undefined {
		try {
			const stats = this.#getStat(filepath);

			return this._makeEntry(stats, pattern);
		} catch (error) {
			if (options.errorFilter(error as ErrnoException)) {
				return undefined;
			}

			throw error;
		}
	}

	#getStat(filepath: string): FsStats {
		return this._statSync(filepath, this._fsStatSettings);
	}

	public dynamic(root: string, options: ReaderOptions): Entry[] {
		return this._walkSync(root, options);
	}

	public static(patterns: Pattern[], options: ReaderOptions): Entry[] {
		const entries: Entry[] = [];

		for (const pattern of patterns) {
			const filepath = this._getFullEntryPath(pattern);
			const entry = this.#getEntry(filepath, pattern, options);

			if (entry === undefined || !options.entryFilter(entry)) {
				continue;
			}

			entries.push(entry);
		}

		return entries;
	}
}
