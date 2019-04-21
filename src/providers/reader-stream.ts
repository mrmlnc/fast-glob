import * as stream from 'stream';

import * as readdir from '@mrmlnc/readdir-enhanced';

import FileSystemStream from '../adapters/fs-stream';
import { Task } from '../managers/tasks';
import { Entry } from '../types/entries';
import Reader from './reader';

class TransformStream extends stream.Transform {
	constructor(private readonly reader: ReaderStream) {
		super({ objectMode: true });
	}

	public _transform(entry: Entry, _encoding: string, callback: Function): void {
		callback(null, this.reader.transform(entry));
	}
}

export default class ReaderStream extends Reader<NodeJS.ReadableStream> {
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
	public api(root: string, task: Task, options: readdir.Options): NodeJS.ReadableStream {
		if (task.dynamic) {
			return this.dynamicApi(root, options);
		}

		return this.staticApi(task, options);
	}

	/**
	 * Api for dynamic tasks.
	 */
	public dynamicApi(root: string, options: readdir.Options): NodeJS.ReadableStream {
		return readdir.readdirStreamStat(root, options);
	}

	/**
	 * Api for static tasks.
	 */
	public staticApi(task: Task, options: readdir.Options): NodeJS.ReadableStream {
		return this.fsAdapter.read(task.patterns, options.filter as readdir.FilterFunction);
	}
}
