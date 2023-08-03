import ReaderSync from '../readers/sync';
import Provider from './provider';

import type Settings from '../settings';
import type { Task } from '../managers/tasks';
import type { Entry, EntryItem, ReaderOptions } from '../types';

export default class ProviderSync extends Provider<EntryItem[]> {
	protected _reader: ReaderSync;

	constructor(settings: Settings) {
		super(settings);

		this._reader = new ReaderSync(settings);
	}

	public read(task: Task): EntryItem[] {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const entries = this.api(root, task, options);

		return entries.map((entry) => options.transform(entry));
	}

	public api(root: string, task: Task, options: ReaderOptions): Entry[] {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
