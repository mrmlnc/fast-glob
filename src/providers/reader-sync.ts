import * as readdir from 'readdir-enhanced';

import Reader from './reader';

import { ITask } from '../managers/tasks';
import { Entry, EntryItem } from '../types/entries';

export default class ReaderSync extends Reader {
	/**
	 * Returns founded paths with fs.Stats.
	 */
	public apiWithStat(root: string, options: readdir.IReaddirOptions): Entry[] {
		return readdir.readdirSyncStat(root, options);
	}

	/**
	 * Returns founded paths.
	 */
	public api(root: string, options: readdir.IReaddirOptions): string[] {
		return readdir.sync(root, options);
	}

	/**
	 * Returns entries.
	 */
	public getEntries(root: string, options: readdir.IReaddirOptions): EntryItem[] {
		if (this.options.stats) {
			return this.apiWithStat(root, options);
		}

		return this.api(root, options);
	}

	/**
	 * Use sync API to read entries for Task.
	 */
	public read(task: ITask): EntryItem[] {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);

		try {
			const entries: EntryItem[] = this.getEntries(root, options);

			return this.options.transform === null ? entries : entries.map<EntryItem>(this.options.transform);
		} catch (err) {
			if (this.isEnoentCodeError(err)) {
				return [];
			}

			throw err;
		}
	}
}
