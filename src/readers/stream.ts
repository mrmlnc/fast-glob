import * as fs from 'fs';
import { PassThrough } from 'stream';

import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';

import { Entry, ErrnoException, Pattern, ReaderOptions } from '../types';
import Reader from './reader';

export default class ReaderStream extends Reader<NodeJS.ReadableStream> {
	protected _walkStream: typeof fsWalk.walkStream = fsWalk.walkStream;
	protected _stat: typeof fsStat.stat = fsStat.stat;

	public dynamic(root: string, options: ReaderOptions): NodeJS.ReadableStream {
		return this._walkStream(root, options);
	}

	public static(patterns: Pattern[], options: ReaderOptions): NodeJS.ReadableStream {
		const filepaths = patterns.map(this._getFullEntryPath, this);

		const stream = new PassThrough({ objectMode: true });
		let matches = 0;

		stream._write = (index: number, _enc, done) => {
			if (options.maxMatches === matches) {
				// This is not ideal because we are still passing patterns to write
				// even though we know the stream is already finished. We can't use
				// .writableEnded either because finding matches is asynchronous
				// The best we could do is to await the write inside the for loop below
				// however that would mean that this whole function would become async
				done();
				return;
			}

			return this._getEntry(filepaths[index], patterns[index], options)
				.then((entry) => {
					if (entry !== null && options.entryFilter(entry)) {
						stream.push(entry);
						matches++;
					}

					if (index === filepaths.length - 1 || options.maxMatches === matches) {
						stream.end();
					}

					done();
				})
				.catch(done);
		};

		for (let i = 0; i < filepaths.length; i++) {
			if (stream.writableEnded) {
				break;
			}
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
				return error === null ? resolve(stats) : reject(error);
			});
		});
	}
}
