import * as fs from 'fs';
import * as path from 'path';

import Settings from '../settings';
import { Entry, Pattern, ReaderOptions } from '../types/index';
import * as utils from '../utils/index';

export default abstract class Reader<T> {
	constructor(protected readonly _settings: Settings) { }

	public abstract dynamic(root: string, options: ReaderOptions): T;
	public abstract static(filepath: string[], options: ReaderOptions): T;

	protected _getFullEntryPath(filepath: string): string {
		return path.resolve(this._settings.cwd, filepath);
	}

	protected _makeEntry(stats: fs.Stats, pattern: Pattern): Entry {
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
