import { Readable } from 'node:stream';

import { Provider } from './provider';

import type { IReaderStream } from '../readers';
import type Settings from '../settings';
import type { Task } from '../managers/tasks';
import type { Entry, ErrnoException, ReaderOptions } from '../types';

export class ProviderStream extends Provider<Readable> {
	readonly #reader: IReaderStream;

	constructor(reader: IReaderStream, settings: Settings) {
		super(settings);

		this.#reader = reader;
	}

	public read(task: Task): Readable {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const source = this.api(root, task, options);
		const destination = new Readable({ objectMode: true, read: () => { /* noop */ } });

		source
			.once('error', (error: ErrnoException) => destination.emit('error', error))
			.on('data', (entry: Entry) => destination.emit('data', options.transform(entry)))
			.once('end', () => destination.emit('end'));

		destination
			.once('close', () => source.destroy());

		return destination;
	}

	public api(root: string, task: Task, options: ReaderOptions): Readable {
		if (task.dynamic) {
			return this.#reader.dynamic(root, options);
		}

		return this.#reader.static(task.patterns, options);
	}
}
