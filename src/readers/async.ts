import * as fsWalk from '@nodelib/fs.walk';

import Reader from './reader';
import ReaderStream from './stream';

import type { Entry, ReaderOptions, Pattern } from '../types';

export default class ReaderAsync extends Reader<Promise<Entry[]>> {
	protected _walkAsync: typeof fsWalk.walk = fsWalk.walk;
	protected _readerStream: ReaderStream = new ReaderStream(this._settings);

	public dynamic(root: string, options: ReaderOptions): Promise<Entry[]> {
		return new Promise((resolve, reject) => {
			this._walkAsync(root, options, (error, entries) => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (error === null) {
					resolve(entries);
				} else {
					reject(error);
				}
			});
		});
	}

	public async static(patterns: Pattern[], options: ReaderOptions): Promise<Entry[]> {
		const entries: Entry[] = [];

		const stream = this._readerStream.static(patterns, options);

		// After #235, replace it with an asynchronous iterator.
		return new Promise((resolve, reject) => {
			stream.once('error', reject);
			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('end', () => {
				resolve(entries);
			});
		});
	}
}
