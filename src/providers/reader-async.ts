import * as readdir from 'readdir-enhanced';

import Reader from './reader';

import { ITask } from '../managers/tasks';
import { TEntryItem } from '../types/entries';

export default class ReaderAsync extends Reader {
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
	 * Use sync API to read entries for Task.
	 */
	public read(task: ITask): Promise<TEntryItem[]> {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);

		const entries: TEntryItem[] = [];

		return new Promise((resolve, reject) => {
			const stream: NodeJS.ReadableStream = this.getStream(root, options);

			stream.on('error', (err) => {
				this.isEnoentCodeError(err) ? resolve([]) : reject(err);
				stream.pause();
			});

			stream.on('data', (entry) => entries.push(this.options.transform ? this.options.transform(entry) : entry));
			stream.on('end', () => resolve(entries));
		});
	}
}
