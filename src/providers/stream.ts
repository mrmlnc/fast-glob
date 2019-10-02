import { Readable } from 'stream';

import { Task } from '../managers/tasks';
import ReaderStream from '../readers/stream';
import { Entry, ErrnoException, ReaderOptions } from '../types';
import Provider from './provider';

export default class ProviderStream extends Provider<NodeJS.ReadableStream> {
	protected _reader: ReaderStream = new ReaderStream(this._settings);

	public read(task: Task): NodeJS.ReadableStream {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const source = this.api(root, task, options);
		const destination = new Readable({ objectMode: true, read: () => { /* noop */ } });

		source
			.once('error', (error: ErrnoException) => destination.emit('error', error))
			.on('data', (entry: Entry) => destination.emit('data', options.transform(entry)))
			.once('end', () => destination.emit('end'));

		return destination;
	}

	public api(root: string, task: Task, options: ReaderOptions): NodeJS.ReadableStream {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
