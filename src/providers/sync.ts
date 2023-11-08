import { Provider } from './provider';

import type { IReaderSync } from '../readers';
import type Settings from '../settings';
import type { Task } from '../managers/tasks';
import type { Entry, EntryItem, ReaderOptions } from '../types';

export class ProviderSync extends Provider<EntryItem[]> {
	readonly #reader: IReaderSync;

	constructor(reader: IReaderSync, settings: Settings) {
		super(settings);

		this.#reader = reader;
	}

	public read(task: Task): EntryItem[] {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const entries = this.api(root, task, options);

		return entries.map((entry) => options.transform(entry));
	}

	public api(root: string, task: Task, options: ReaderOptions): Entry[] {
		if (task.dynamic) {
			return this.#reader.dynamic(root, options);
		}

		return this.#reader.static(task.patterns, options);
	}
}
