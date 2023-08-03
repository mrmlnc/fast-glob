import { Readable } from 'stream';

import { Task } from '../managers/tasks';
import ReaderStream from '../readers/stream';
import { Entry, ErrnoException, ReaderOptions } from '../types';
import Provider from './provider';

export default class ProviderStream extends Provider<Readable> {
	protected _reader: ReaderStream = new ReaderStream(this._settings);

	public read(task: Task): Readable {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		const baseDirectoryStream = this._getBasePatternDirectoryStream(task, options);
		const taskStream = this._getTaskStream(root, task, options);
		const destination = new Readable({ objectMode: true, read: () => { /* noop */ } });

		if (baseDirectoryStream !== null) {
			// Do not terminate the destination stream because stream with tasks will emit entries.
			baseDirectoryStream
				.once('error', (error: ErrnoException) => destination.emit('error', error))
				.on('data', (entry: Entry) => destination.emit('data', options.transform(entry)));
		}

		taskStream
			.once('error', (error: ErrnoException) => destination.emit('error', error))
			.on('data', (entry: Entry) => destination.emit('data', options.transform(entry)))
			.once('end', () => destination.emit('end'));

		destination.once('close', () => {
			if (baseDirectoryStream !== null) {
				baseDirectoryStream.destroy();
			}

			taskStream.destroy();
		});

		return destination;
	}

	private _getBasePatternDirectoryStream(task: Task, options: ReaderOptions): Readable | null {
		/**
		 * Currently, the micromatch package cannot match the input string `.` when the '**' pattern is used.
		 */
		if (task.base === '.') {
			return null;
		}

		if (task.dynamic && this._settings.includePatternBaseDirectory) {
			return this._reader.static([task.base], options);
		}

		return null;
	}

	private _getTaskStream(root: string, task: Task, options: ReaderOptions): Readable {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
