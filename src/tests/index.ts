import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';

import { Entry, EntryItem } from '../types/index';

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

interface FakeFsStatOptions {
	isFile: boolean;
	isDirectory: boolean;
	isSymbolicLink: boolean;
	path: string;
}

class FakeEntry extends fs.Stats {
	public path: string = this._options.path || path.join('fixtures', 'entry');
	public depth: number = this.path.split(path.sep).length - 2;

	constructor(private readonly _options: Partial<FakeFsStatOptions> = {}) {
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

export function getEntry(options: Partial<FakeFsStatOptions> = {}): Entry {
	return new FakeEntry(options);
}

export function getFileEntry(options: Partial<FakeFsStatOptions> = {}): Entry {
	return new FakeEntry({
		isFile: true,
		path: path.join('fixtures', 'file.txt'),
		...options
	});
}

export function getDirectoryEntry(options: Partial<FakeFsStatOptions> = {}): Entry {
	return new FakeEntry({
		isDirectory: true,
		path: path.join('fixtures', 'directory'),
		...options
	});
}
