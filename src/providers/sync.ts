import { Task } from '../managers/tasks';
import ReaderSync from '../readers/sync';
import { Entry, EntryItem, ReaderOptions } from '../types/index';
import Provider from './provider';

export default class ProviderSync extends Provider<EntryItem[]> {
	protected _reader: ReaderSync = new ReaderSync(this._settings);

	/**
	 * Use sync API to read entries for Task.
	 */
	public read(task: Task): EntryItem[] {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);

		try {
			const entries: Entry[] = this.api(root, task, options);

			return entries.map<EntryItem>(options.transform);
		} catch (err) {
			if (this.isEnoentCodeError(err as NodeJS.ErrnoException)) {
				return [];
			}

			throw err;
		}
	}

	/**
	 * Returns founded paths.
	 */
	public api(root: string, task: Task, options: ReaderOptions): Entry[] {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
