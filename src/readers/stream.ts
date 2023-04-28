import { PassThrough } from 'stream';

import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';

import Reader from './reader';

import type { Entry, ErrnoException, Pattern, ReaderOptions } from '../types';
import type { Readable } from 'stream';
import type * as fs from 'fs';

export default class ReaderStream extends Reader<Readable> {
	protected _walkStream: typeof fsWalk.walkStream = fsWalk.walkStream;
	protected _stat: typeof fsStat.stat = fsStat.stat;

	public dynamic(root: string, options: ReaderOptions): Readable {
		return this._walkStream(root, options);
	}

	public static(patterns: Pattern[], options: ReaderOptions): Readable {
		const filepaths = patterns.map((pattern) => this._getFullEntryPath(pattern));

		const stream = new PassThrough({ objectMode: true });

		stream._write = (index: number, _enc, done) => {
			return this._getEntry(filepaths[index], patterns[index], options)
				.then((entry) => {
					if (entry !== null && options.entryFilter(entry)) {
						stream.push(entry);
					}

					if (index === filepaths.length - 1) {
						stream.end();
					}

					done();
				})
				.catch(done);
		};

		for (let i = 0; i < filepaths.length; i++) {
			stream.write(i);
		}

		return stream;
	}

	private _getEntry(filepath: string, pattern: Pattern, options: ReaderOptions): Promise<Entry | null> {
		return this._getStat(filepath)
			.then((stats) => this._makeEntry(stats, pattern))
			.catch((error: ErrnoException) => {
				if (options.errorFilter(error)) {
					return null;
				}

				throw error;
			});
	}

	private _getStat(filepath: string): Promise<fs.Stats> {
		return new Promise((resolve, reject) => {
			this._stat(filepath, this._fsStatSettings, (error: NodeJS.ErrnoException | null, stats) => {
				if (error === null) {
					resolve(stats);
				} else {
					reject(error);
				}
			});
		});
	}
}
