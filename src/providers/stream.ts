import * as stream from 'stream';

import FileSystemStream from '../adapters/fs-stream';
import { Task } from '../managers/tasks';
import ReaderStream from '../readers/stream';
import { Entry, ReaderOptions } from '../types/index';
import Provider from './provider';

class TransformStream extends stream.Transform {
	constructor(private readonly _provider: ProviderStream) {
		super({ objectMode: true });
	}

	public _transform(entry: Entry, _encoding: string, callback: Function): void {
		callback(null, this._provider.transform(entry));
	}
}

export default class ProviderStream extends Provider<NodeJS.ReadableStream> {
	protected _reader: ReaderStream = new ReaderStream(this.settings);

	/**
	 * Returns FileSystem adapter.
	 */
	public get fsAdapter(): FileSystemStream {
		return new FileSystemStream(this.settings);
	}

	/**
	 * Use stream API to read entries for Task.
	 */
	public read(task: Task): NodeJS.ReadableStream {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);
		const transform = new TransformStream(this);

		const readable: NodeJS.ReadableStream = this.api(root, task, options);

		return readable
			.on('error', (err: NodeJS.ErrnoException) => this.isEnoentCodeError(err) ? null : transform.emit('error', err))
			.pipe(transform);
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
