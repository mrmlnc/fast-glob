import * as stream from 'stream';

import * as readdir from 'readdir-enhanced';

import Reader from './reader';

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

export default class ReaderStream extends Reader {
	/**
	 * Returns founded paths.
	 */
	public api(root: string, options: readdir.Options): NodeJS.ReadableStream {
		return readdir.readdirStreamStat(root, options);
	}

	/**
	 * Use stream API to read entries for Task.
	 */
	public read(task: ITask): NodeJS.ReadableStream {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);
		const transform = new TransformStream(this);

		const readable: NodeJS.ReadableStream = this.api(root, options);

		return readable
			.once('error', (err) => this.isEnoentCodeError(err) ? null : transform.emit('error', err))
			.pipe(transform);
	}
}
