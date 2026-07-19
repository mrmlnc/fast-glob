
import type { ReaderSyncInterface } from '../readers';
import type Settings from '../settings';
import type { Task } from '../managers/tasks';
import type { Entry, EntryItem, ReaderOptions } from '../types';
import { Provider } from './provider';

export class ProviderSync extends Provider<EntryItem[]> {
	readonly #reader: ReaderSyncInterface;

	constructor(reader: ReaderSyncInterface, settings: Settings) {
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

		return this.#reader.static(task.positive, options);
	}
}
