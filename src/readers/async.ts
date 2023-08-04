import * as fsWalk from '@nodelib/fs.walk';

import { Reader } from './reader';
import { ReaderStream } from './stream';

import type Settings from '../settings';
import type { Entry, ReaderOptions, Pattern } from '../types';

export interface IReaderAsync {
	dynamic: (root: string, options: ReaderOptions) => Promise<Entry[]>;
	static: (patterns: Pattern[], options: ReaderOptions) => Promise<Entry[]>;
}

export class ReaderAsync extends Reader<Promise<Entry[]>> implements IReaderAsync {
	protected _walkAsync: typeof fsWalk.walk = fsWalk.walk;
	protected _readerStream: ReaderStream;

	constructor(settings: Settings) {
		super(settings);

		this._readerStream = new ReaderStream(settings);
	}

	public dynamic(root: string, options: ReaderOptions): Promise<Entry[]> {
		return new Promise((resolve, reject) => {
			this._walkAsync(root, options, (error, entries) => {
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

		for await (const entry of this._readerStream.static(patterns, options)) {
			entries.push(entry as Entry);
		}

		return entries;
	}
}
