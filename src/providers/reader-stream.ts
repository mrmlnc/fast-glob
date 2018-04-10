import * as stream from 'stream';

import * as readdir from '@mrmlnc/readdir-enhanced';

import Reader from './reader';

import FileSystemStream from '../adapters/fs-stream';

import { ITask } from '../managers/tasks';
import { Entry } from '../types/entries';

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
	 * Use stream API to read entries for Task.
	 */
	public read(task: ITask): NodeJS.ReadableStream {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);
		const transform = new TransformStream(this);

		const readable: NodeJS.ReadableStream = this.api(root, task, options);

		return readable
			.once('error', (err) => this.isEnoentCodeError(err) ? null : transform.emit('error', err))
			.pipe(transform);
	}

	/**
	 * Returns founded paths.
	 */
	public api(root: string, task: ITask, options: readdir.Options): NodeJS.ReadableStream {
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
	public staticApi(task: ITask, options: readdir.Options): NodeJS.ReadableStream {
		const fsAdapter = new FileSystemStream(this.options);

		return fsAdapter.read(task.patterns, options.filter as readdir.FilterFunction);
	}
}
