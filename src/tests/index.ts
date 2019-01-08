import * as fs from 'fs';
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

interface IFakeFsStatOptions {
	isFile: boolean;
	isDirectory: boolean;
	isSymbolicLink: boolean;
	path: string;
}

class FakeEntry extends fs.Stats {
	public path: string = this._options.path || 'fixtures/entry';
	public depth: number = this.path.split('/').length - 2;

	constructor(private readonly _options: Partial<IFakeFsStatOptions> = {}) {
		super();
	}

	public isFile(): boolean {
		return this._options.isFile || false;
	}

	public isDirectory(): boolean {
		return this._options.isDirectory || false;
	}

	public isSymbolicLink(): boolean {
		return this._options.isSymbolicLink || false;
	}
}

export function getEntry(options: Partial<IFakeFsStatOptions> = {}): Entry {
	return new FakeEntry(options);
}

export function getFileEntry(options: Partial<IFakeFsStatOptions> = {}): Entry {
	return new FakeEntry({
		isFile: true,
		path: 'fixtures/file.txt',
		...options
	});
}

export function getDirectoryEntry(options: Partial<IFakeFsStatOptions> = {}): Entry {
	return new FakeEntry({
		isDirectory: true,
		path: 'fixtures/directory',
		...options
	});
}
