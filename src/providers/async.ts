
import type { ReaderAsyncInterface } from '../readers';
import type Settings from '../settings';
import type { Task } from '../managers/tasks';
import type { Entry, EntryItem, ReaderOptions } from '../types';
import { Provider } from './provider';

export class ProviderAsync extends Provider<Promise<EntryItem[]>> {
	readonly #reader: ReaderAsyncInterface;

	constructor(reader: ReaderAsyncInterface, settings: Settings) {
		super(settings);

		this.#reader = reader;
	}

	public async read(task: Task): Promise<EntryItem[]> {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const entries = await this.api(root, task, options);

		return entries.map((entry) => options.transform(entry));
	}

	public async api(root: string, task: Task, options: ReaderOptions): Promise<Entry[]> {
		if (task.dynamic) {
			return this.#reader.dynamic(root, options);
		}

		return this.#reader.static(task.positive, options);
	}
}
