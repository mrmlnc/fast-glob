import { Provider } from './provider.js';

import type { IReaderAsync } from '../readers/index.js';
import type Settings from '../settings.js';
import type { Task } from '../managers/tasks.js';
import type { Entry, EntryItem, ReaderOptions } from '../types/index.js';

export class ProviderAsync extends Provider<Promise<EntryItem[]>> {
	readonly #reader: IReaderAsync;

	constructor(reader: IReaderAsync, settings: Settings) {
		super(settings);

		this.#reader = reader;
	}

	public async read(task: Task): Promise<EntryItem[]> {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const entries = await this.api(root, task, options);

		return entries.map((entry) => options.transform(entry));
	}

	public api(root: string, task: Task, options: ReaderOptions): Promise<Entry[]> {
		if (task.dynamic) {
			return this.#reader.dynamic(root, options);
		}

		return this.#reader.static(task.patterns, options);
	}
}
