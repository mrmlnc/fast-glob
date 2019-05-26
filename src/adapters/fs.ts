import * as fs from 'fs';
import * as path from 'path';

import Settings from '../settings';
import { Entry, EntryFilterFunction, Pattern } from '../types/index';
import * as utils from '../utils/index';

export default abstract class FileSystem<T> {
	constructor(protected readonly _settings: Settings) { }

	/**
	 * The main logic of reading the entries that must be implemented by each adapter.
	 */
	public abstract read(filepaths: string[], filter: EntryFilterFunction): T;

	/**
	 * Return full path to entry.
	 */
	public getFullEntryPath(filepath: string): string {
		return path.resolve(this._settings.cwd, filepath);
	}

	/**
	 * Return an implementation of the Entry interface.
	 */
	public makeEntry(stats: fs.Stats, pattern: Pattern): Entry {
		const entry: Entry = {
			name: pattern,
			path: pattern,
			dirent: utils.fs.createDirentFromStats(pattern, stats)
		};

		if (this._settings.stats) {
			entry.stats = stats;
		}

		return entry;
	}
}
