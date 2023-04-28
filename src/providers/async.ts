import ReaderAsync from '../readers/async';
import Provider from './provider';

import type Settings from '../settings';
import type { Task } from '../managers/tasks';
import type { Entry, EntryItem, ReaderOptions } from '../types';

export default class ProviderAsync extends Provider<Promise<EntryItem[]>> {
	protected _reader: ReaderAsync;

	constructor(settings: Settings) {
		super(settings);

		this._reader = new ReaderAsync(settings);
	}

	public async read(task: Task): Promise<EntryItem[]> {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const entries = await this.api(root, task, options);

		return entries.map((entry) => options.transform(entry));
	}

	public api(root: string, task: Task, options: ReaderOptions): Promise<Entry[]> {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
