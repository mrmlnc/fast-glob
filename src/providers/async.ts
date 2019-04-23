import * as readdir from '@mrmlnc/readdir-enhanced';

import FileSystemStream from '../adapters/fs-stream';
import { Task } from '../managers/tasks';
import { Entry, EntryItem } from '../types/index';
import Provider from './provider';

export default class ProviderAsync extends Provider<Promise<EntryItem[]>> {
	/**
	 * Returns FileSystem adapter.
	 */
	public get fsAdapter(): FileSystemStream {
		return new FileSystemStream(this.settings);
	}

	/**
	 * Use async API to read entries for Task.
	 */
	public read(task: Task): Promise<EntryItem[]> {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);

		const entries: EntryItem[] = [];

		return new Promise((resolve, reject) => {
			const stream: NodeJS.ReadableStream = this.api(root, task, options);

			stream.on('error', (err: NodeJS.ErrnoException) => {
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
