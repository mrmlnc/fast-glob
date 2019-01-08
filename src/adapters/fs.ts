import * as fs from 'fs';
import * as path from 'path';

import { FilterFunction } from '@mrmlnc/readdir-enhanced';

import { IOptions } from '../managers/options';
import { Entry } from '../types/entries';
import { Pattern } from '../types/patterns';

export default abstract class FileSystem<T> {
	constructor(private readonly options: IOptions) { }

	/**
	 * The main logic of reading the entries that must be implemented by each adapter.
	 */
	public abstract read(filepaths: string[], filter: FilterFunction): T;

	/**
	 * Return full path to entry.
	 */
	public getFullEntryPath(filepath: string): string {
		return path.resolve(this.options.cwd, filepath);
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
