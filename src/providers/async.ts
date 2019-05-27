import { Task } from '../managers/tasks';
import ReaderStream from '../readers/stream';
import { Entry, EntryItem, ErrnoException, ReaderOptions } from '../types/index';
import * as utils from '../utils/index';
import Provider from './provider';

export default class ProviderAsync extends Provider<Promise<EntryItem[]>> {
	protected _reader: ReaderStream = new ReaderStream(this._settings);

	/**
	 * Use async API to read entries for Task.
	 */
	public read(task: Task): Promise<EntryItem[]> {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);

		const entries: EntryItem[] = [];

		return new Promise((resolve, reject) => {
			const stream: NodeJS.ReadableStream = this.api(root, task, options);

			stream.on('error', (err: ErrnoException) => {
				utils.errno.isEnoentCodeError(err) ? resolve([]) : reject(err);
				stream.pause();
			});

			stream.on('data', (entry: Entry) => entries.push(options.transform(entry)));
			stream.on('end', () => resolve(entries));
		});
	}

	/**
	 * Returns founded paths.
	 */
	public api(root: string, task: Task, options: ReaderOptions): NodeJS.ReadableStream {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
