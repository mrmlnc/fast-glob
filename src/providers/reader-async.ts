import * as readdir from '@mrmlnc/readdir-enhanced';

import Reader from './reader';

import FileSystemStream from '../adapters/fs-stream';

import { ITask } from '../managers/tasks';
import { Entry, EntryItem } from '../types/entries';

export default class ReaderAsync extends Reader<Promise<EntryItem[]>> {
	/**
	 * Use async API to read entries for Task.
	 */
	public read(task: ITask): Promise<EntryItem[]> {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);

		const entries: EntryItem[] = [];

		return new Promise((resolve, reject) => {
			const stream: NodeJS.ReadableStream = this.api(root, task, options);

			stream.on('error', (err) => {
				this.isEnoentCodeError(err) ? resolve([]) : reject(err);
				stream.pause();
			});

			stream.on('data', (entry: Entry) => entries.push(this.transform(entry)));
			stream.on('end', () => resolve(entries));
		});
	}

	/**
	 * Returns founded paths.
	 */
	public api(root: string, task: ITask, options: readdir.Options): NodeJS.ReadableStream {
		if (task.dynamic) {
			return this.dynamicApi(root, options);
		}

		return this.staticApi(task);
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
	public staticApi(task: ITask): NodeJS.ReadableStream {
		const fsAdapter = new FileSystemStream(this.options);

		const filter = this.entryFilter.getFilter(['**'], task.negative);

		return fsAdapter.read(task.patterns, filter);
	}
}
