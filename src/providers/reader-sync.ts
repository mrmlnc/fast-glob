import * as readdir from '@mrmlnc/readdir-enhanced';

import Reader from './reader';

import FileSystemSync from '../adapters/fs-sync';

import { ITask } from '../managers/tasks';
import { Entry, EntryItem } from '../types/entries';

export default class ReaderSync extends Reader<EntryItem[]> {
	/**
	 * Use sync API to read entries for Task.
	 */
	public read(task: ITask): EntryItem[] {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);

		try {
			const entries: Entry[] = this.api(root, task, options);

			return entries.map<EntryItem>(this.transform, this);
		} catch (err) {
			if (this.isEnoentCodeError(err)) {
				return [];
			}

			throw err;
		}
	}

	/**
	 * Returns founded paths.
	 */
	public api(root: string, task: ITask, options: readdir.Options): Entry[] {
		if (task.dynamic) {
			return this.dynamicApi(root, options);
		}

		return this.staticApi(task);
	}

	/**
	 * Api for dynamic tasks.
	 */
	public dynamicApi(root: string, options: readdir.Options): Entry[] {
		return readdir.readdirSyncStat(root, options);
	}

	/**
	 * Api for static tasks.
	 */
	public staticApi(task: ITask): Entry[] {
		const fsAdapter = new FileSystemSync(this.options);

		const filter = this.entryFilter.getFilter(task.positive, task.negative);

		return fsAdapter.read(task.patterns, filter);
	}
}
