import * as fs from 'fs';
import * as stream from 'stream';

import * as fsStat from '@nodelib/fs.stat';

import FileSystem from './fs';

import { FilterFunction } from '@mrmlnc/readdir-enhanced';

import { Entry } from '../types/entries';
import { Pattern } from '../types/patterns';

export default class FileSystemStream extends FileSystem<NodeJS.ReadableStream> {
	/**
	 * Use stream API to read entries for Task.
	 */
	public read(patterns: string[], filter: FilterFunction): NodeJS.ReadableStream {
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
		return fsStat.stat(filepath, { throwErrorOnBrokenSymlinks: false });
	}
}
