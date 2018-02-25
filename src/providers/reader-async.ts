import * as readdir from '@mrmlnc/readdir-enhanced';

import Reader from './reader';

import { ITask } from '../managers/tasks';
import { Entry, EntryItem } from '../types/entries';

export default class ReaderAsync extends Reader<Promise<EntryItem[]>> {
	/**
	 * Returns founded paths.
	 */
	public api(root: string, options: readdir.Options): NodeJS.ReadableStream {
		return readdir.readdirStreamStat(root, options);
	}

	/**
	 * Use async API to read entries for Task.
	 */
	public read(task: ITask): Promise<EntryItem[]> {
		const root = this.getRootDirectory(task);
		const options = this.getReaderOptions(task);

		const entries: EntryItem[] = [];

		return new Promise((resolve, reject) => {
			const stream: NodeJS.ReadableStream = this.api(root, options);

			stream.on('error', (err) => {
				this.isEnoentCodeError(err) ? resolve([]) : reject(err);
				stream.pause();
			});

			stream.on('data', (entry: Entry) => entries.push(this.transform(entry)));
			stream.on('end', () => resolve(entries));
		});
	}
}
