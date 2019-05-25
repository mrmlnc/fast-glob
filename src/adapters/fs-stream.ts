import * as fs from 'fs';
import * as stream from 'stream';

import * as fsStat from '@nodelib/fs.stat';

import FileSystem from './fs';

import { Entry, EntryFilterFunction, Pattern } from '../types/index';

export default class FileSystemStream extends FileSystem<NodeJS.ReadableStream> {
	/**
	 * Use stream API to read entries for Task.
	 */
	public read(patterns: string[], filter: EntryFilterFunction): NodeJS.ReadableStream {
		const filepaths = patterns.map(this.getFullEntryPath, this);

		const transform = new stream.Transform({ objectMode: true });

		transform._transform = (index: number, _enc, done) => {
			return this.getEntry(filepaths[index], patterns[index]).then((entry) => {
				if (entry !== null && filter(entry)) {
					transform.push(entry);
				}

				if (index === filepaths.length - 1) {
					transform.end();
				}

				done();
			});
		};

		for (let i = 0; i < filepaths.length; i++) {
			transform.write(i);
		}

		return transform;
	}

	/**
	 * Return entry for the provided path.
	 */
	public getEntry(filepath: string, pattern: Pattern): Promise<Entry | null> {
		return this.getStat(filepath)
			.then((stat) => this.makeEntry(stat, pattern))
			.catch(() => null);
	}

	/**
	 * Return fs.Stats for the provided path.
	 */
	public getStat(filepath: string): Promise<fs.Stats> {
		const options: fsStat.Options = {
			followSymbolicLink: this._settings.followSymbolicLinks,
			throwErrorOnBrokenSymbolicLink: this._settings.throwErrorOnBrokenSymbolicLink
		};

		return new Promise((resolve, reject) => {
			fsStat.stat(filepath, options, (error, stats) => {
				error ? reject(error) : resolve(stats);
			});
		});
	}
}
