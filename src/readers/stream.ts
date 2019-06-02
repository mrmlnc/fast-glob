import * as fs from 'fs';
import { PassThrough } from 'stream';

import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';

import { Entry, ErrnoException, Pattern, ReaderOptions } from '../types/index';
import Reader from './reader';

export default class ReaderStream extends Reader<NodeJS.ReadableStream> {
	protected _walkStream: typeof fsWalk.walkStream = fsWalk.walkStream;
	protected _stat: typeof fsStat.stat = fsStat.stat;

	public dynamic(root: string, options: ReaderOptions): NodeJS.ReadableStream {
		const walk = this._walkStream(root, options);

		walk.once('error', (error: ErrnoException) => {
			if (this._isFatalError(error)) {
				walk.emit('error', error);
			}
		});

		return walk;
	}

	public static(patterns: string[], options: ReaderOptions): NodeJS.ReadableStream {
		const filepaths = patterns.map(this._getFullEntryPath, this);

		const stream = new PassThrough({ objectMode: true });

		stream._write = (index: number, _enc, done) => {
			return this._getEntry(filepaths[index], patterns[index])
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

	private _getEntry(filepath: string, pattern: Pattern): Promise<Entry | null> {
		return this._getStat(filepath)
			.then((stats) => this._makeEntry(stats, pattern))
			.catch((error: ErrnoException) => {
				if (this._isFatalError(error)) {
					throw error;
				}

				return null;
			});
	}

	private _getStat(filepath: string): Promise<fs.Stats> {
		return new Promise((resolve, reject) => {
			this._stat(filepath, this._fsStatSettings, (error, stats) => {
				error ? reject(error) : resolve(stats);
			});
		});
	}
}
