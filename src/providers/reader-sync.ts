import * as readdir from 'readdir-enhanced';

import Reader from './reader';

import { ITask } from '../managers/tasks';
import { Entry, EntryItem } from '../types/entries';

export default class ReaderSync extends Reader {
	/**
	 * Returns founded paths.
	 */
	public api(root: string, options: readdir.Options): Entry[] {
		return readdir.readdirSyncStat(root, options);
	}

	/**
	 * Use sync API to read entries for Task.
	 */
	public read(task: ITask): EntryItem[] {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);

		try {
			const entries: Entry[] = this.api(root, options);

			return entries.map<EntryItem>(this.transform, this);
		} catch (err) {
			if (this.isEnoentCodeError(err)) {
				return [];
			}

			throw err;
		}
	}
}
