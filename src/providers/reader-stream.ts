import * as stream from 'stream';

import * as readdir from 'readdir-enhanced';

import Reader from './reader';

import { IOptions } from '../managers/options';
import { ITask } from '../managers/tasks';
import { EntryItem } from '../types/entries';

class TransformStream extends stream.Transform {
	constructor(private readonly reader: ReaderStream, readonly options: IOptions) {
		super(options.stats ? { objectMode: true } : { encoding: 'utf-8' });
	}

	public _transform(chunk: string | Buffer, _encoding: string, callback: Function): void {
		const entry: EntryItem = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;

		callback(null, this.reader.transform(entry));
	}
}

export default class ReaderStream extends Reader {
	/**
	 * Returns founded paths with fs.Stats.
	 */
	public apiWithStat(root: string, options: readdir.IReaddirOptions): NodeJS.ReadableStream {
		return readdir.readdirStreamStat(root, options);
	}

	/**
	 * Returns founded paths.
	 */
	public api(root: string, options: readdir.IReaddirOptions): NodeJS.ReadableStream {
		return readdir.stream(root, options);
	}

	/**
	 * Returns stream.
	 */
	public getStream(root: string, options: readdir.IReaddirOptions): NodeJS.ReadableStream {
		if (this.options.stats) {
			return this.apiWithStat(root, options);
		}

		return this.api(root, options);
	}

	/**
	 * Use stream API to read entries for Task.
	 */
	public read(task: ITask): NodeJS.ReadableStream {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);
		const transform = new TransformStream(this, this.options);

		const readable: NodeJS.ReadableStream = this.getStream(root, options);

		return readable
			.once('error', (err) => this.isEnoentCodeError(err) ? null : transform.emit('error', err))
			.pipe(transform);
	}
}
