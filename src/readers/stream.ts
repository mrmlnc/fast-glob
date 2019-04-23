import * as readdir from '@mrmlnc/readdir-enhanced';

import FileSystemStream from '../adapters/fs-stream';
import Reader from './reader';

export default class ReaderStream extends Reader<NodeJS.ReadableStream> {
	private readonly _fsAdapter: FileSystemStream = new FileSystemStream(this._settings);

	public dynamic(root: string, options: readdir.Options): NodeJS.ReadableStream {
		return readdir.readdirStreamStat(root, options);
	}

	public static(filepaths: string[], options: readdir.Options): NodeJS.ReadableStream {
		return this._fsAdapter.read(filepaths, options.filter as readdir.FilterFunction);
	}
}
