import { Task } from '../managers/tasks';
import ReaderStream from '../readers/stream';
import { Entry, EntryItem, ReaderOptions } from '../types';
import Provider from './provider';

export default class ProviderAsync extends Provider<Promise<EntryItem[]>> {
	protected _reader: ReaderStream = new ReaderStream(this._settings);

	public read(task: Task): Promise<EntryItem[]> {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const entries: EntryItem[] = [];

		return new Promise((resolve, reject) => {
			const stream = this.api(root, task, options);

			stream.once('error', reject);
			stream.on('data', (entry: Entry) => entries.push(options.transform(entry)));
			stream.once('end', () => resolve(entries));
		});
	}

	public api(root: string, task: Task, options: ReaderOptions): NodeJS.ReadableStream {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
