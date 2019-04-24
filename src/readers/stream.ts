import * as fsWalk from '@nodelib/fs.walk';

import FileSystemStream from '../adapters/fs-stream';
import { ReaderOptions } from '../types/index';
import Reader from './reader';

export default class ReaderStream extends Reader<NodeJS.ReadableStream> {
	private readonly _fsAdapter: FileSystemStream = new FileSystemStream(this._settings);

	public dynamic(root: string, options: ReaderOptions): NodeJS.ReadableStream {
		return fsWalk.walkStream(root, options);
	}

	public static(filepaths: string[], options: ReaderOptions): NodeJS.ReadableStream {
		return this._fsAdapter.read(filepaths, options.entryFilter);
	}
}
