import * as stream from 'stream';

import { Entry, EntryItem } from '../types/entries';

export class FakeStream extends stream.Readable {
	constructor(private readonly value: EntryItem, private readonly error: Error | null, opts?: stream.ReadableOptions) {
		super(opts);
	}

	public _read(): void {
		if (this.error === null) {
			this.emit('data', this.value);
		} else {
			this.emit('error', this.error);
		}
		this.push(null);
	}
}

export class EnoentErrnoException extends Error {
	public readonly code: string = 'ENOENT';

	constructor() {
		super();
	}
}

export function getEntry(entry?: Partial<Entry>): Entry {
	return {
		isFile: () => false,
		isDirectory: () => false,
		isSymbolicLink: () => false,
		path: 'path',
		depth: 1,
		...entry
	} as unknown as Entry;
}

export function getFileEntry(dot: boolean): Entry {
	return getEntry({
		path: dot ? 'fixtures/.file.txt' : 'fixtures/file.txt',
		isFile: () => true
	});
}

export function getDirectoryEntry(dot: boolean, isSymbolicLink: boolean): Entry {
	return getEntry({
		path: dot ? 'fixtures/.directory' : 'fixtures/directory',
		isDirectory: () => true,
		isSymbolicLink: () => isSymbolicLink
	});
}
