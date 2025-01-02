import { Provider } from './provider.js';

import type { IReaderSync } from '../readers/index.js';
import type Settings from '../settings.js';
import type { Task } from '../managers/tasks.js';
import type { Entry, EntryItem, ReaderOptions } from '../types/index.js';

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
