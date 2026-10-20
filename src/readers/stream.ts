import { PassThrough, type Readable } from 'node:stream';
import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';
import type {
	Entry,
	ErrnoException,
	FsStats,
	Pattern,
	ReaderOptions,
} from '../types/index.js';
import { Reader } from './reader.js';

export type ReaderStreamInterface = {
	dynamic: (root: string, options: ReaderOptions) => Readable;
	static: (patterns: Pattern[], options: ReaderOptions) => Readable;
};

export class ReaderStream extends Reader<Readable> implements ReaderStreamInterface {
	protected _walkStream: typeof fsWalk.walkStream = fsWalk.walkStream;
	protected _stat: typeof fsStat.stat = fsStat.stat;

	async #getEntry(filepath: string, pattern: Pattern, options: ReaderOptions): Promise<Entry | undefined> {
		return this.#getStat(filepath)
			.then((stats) => this._makeEntry(stats, pattern))
			.catch((error: unknown) => {
				if (options.errorFilter(error as ErrnoException)) {
					return undefined;
				}

				throw error;
			});
	}

	async #getStat(filepath: string): Promise<FsStats> {
		return new Promise((resolve, reject) => {
			this._stat(filepath, this._fsStatSettings, (error, stats) => {
				if (error === null) {
					resolve(stats);
				} else {
					reject(error);
				}
			});
		});
	}

	public dynamic(root: string, options: ReaderOptions): Readable {
		return this._walkStream(root, options);
	}

	public static(patterns: Pattern[], options: ReaderOptions): Readable {
		const filepaths = patterns.map((pattern) => this._getFullEntryPath(pattern));

		const stream = new PassThrough({ objectMode: true, signal: options.signal });

		stream._write = (index: number, _enc, done) => {
			this.#getEntry(filepaths[index], patterns[index], options)
				.then((entry) => {
					if (entry !== undefined && options.entryFilter(entry)) {
						stream.push(entry);
					}

					if (index === filepaths.length - 1) {
						stream.end();
					}

					done();
				})
				.catch(done);
		};

		for (let index = 0; index < filepaths.length; index++) {
			stream.write(index);
		}

		return stream;
	}
}
