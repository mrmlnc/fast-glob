import * as fsWalk from '@nodelib/fs.walk';

import FileSystemSync from '../adapters/fs-sync';
import { Entry, ReaderOptions } from '../types/index';
import Reader from './reader';

export default class ReaderSync extends Reader<Entry[]> {
	private readonly _fsAdapter: FileSystemSync = new FileSystemSync(this._settings);

	public dynamic(root: string, options: ReaderOptions): Entry[] {
		return fsWalk.walkSync(root, options);
	}

	public static(filepaths: string[], options: ReaderOptions): Entry[] {
		return this._fsAdapter.read(filepaths, options.entryFilter);
	}
}
