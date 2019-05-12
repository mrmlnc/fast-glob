import * as fs from 'fs';
import * as path from 'path';

import Settings from '../settings';
import { Entry, EntryFilterFunction, Pattern } from '../types/index';

export default abstract class FileSystem<T> {
	constructor(private readonly settings: Settings) { }

	/**
	 * The main logic of reading the entries that must be implemented by each adapter.
	 */
	public abstract read(filepaths: string[], filter: EntryFilterFunction): T;

	/**
	 * Return full path to entry.
	 */
	public getFullEntryPath(filepath: string): string {
		return path.resolve(this.settings.cwd, filepath);
	}

	/**
	 * Return an implementation of the Entry interface.
	 */
	public makeEntry(stat: fs.Stats, pattern: Pattern): Entry {
		(stat as Entry).path = pattern;
		(stat as Entry).depth = pattern.split('/').length;

		return stat as Entry;
	}
}
