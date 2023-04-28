import type { Task } from '../managers/tasks';
import ReaderSync from '../readers/sync';
import type { Entry, EntryItem, ReaderOptions } from '../types';
import Provider from './provider';

export default class ProviderSync extends Provider<EntryItem[]> {
	protected _reader: ReaderSync = new ReaderSync(this._settings);

	public read(task: Task): EntryItem[] {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const entries = this.api(root, task, options);

		return entries.map(options.transform);
	}

	public api(root: string, task: Task, options: ReaderOptions): Entry[] {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
