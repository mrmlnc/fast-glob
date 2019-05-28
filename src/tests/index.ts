import * as path from 'path';
import * as stream from 'stream';

import { Dirent } from '@nodelib/fs.macchiato';

import { Entry, EntryItem } from '../types/index';

export class FakeStream extends stream.Readable {
	constructor(private readonly _value: EntryItem, private readonly _error: Error | null, opts?: stream.ReadableOptions) {
		super(opts);
	}

	public _read(): void {
		if (this._error === null) {
			this.emit('data', this._value);
		} else {
			this.emit('error', this._error);
		}
		this.push(null);
	}
}

export class EnoentErrnoException extends Error {
	public readonly code: string = 'ENOENT';

	constructor() {
		super('ENOENT error');
	}
}

export class EpermErrnoException extends Error {
	public readonly code: string = 'EPERM';

	constructor() {
		super('EPERM error');
	}
}

interface FakeFsStatOptions {
	name?: string;
	isFile?: boolean;
	isDirectory?: boolean;
	isSymbolicLink?: boolean;
	path?: string;
}

class FakeEntry implements Entry {
	public readonly name: string = this._options.name || 'file.txt';
	public readonly path: string = this._options.path || path.join('fixtures', 'file.txt');
	public readonly dirent: Dirent = new Dirent({
		...this._options,
		name: this.name
	});

	constructor(private readonly _options: FakeFsStatOptions = {}) { }
}

export function getEntry(options: FakeFsStatOptions = {}): Entry {
	return new FakeEntry(options);
}

export function getFileEntry(options: FakeFsStatOptions = {}): Entry {
	return new FakeEntry({
		isFile: true,
		...options
	});
}

export function getDirectoryEntry(options: Partial<FakeFsStatOptions> = {}): Entry {
	return new FakeEntry({
		isFile: false,
		isDirectory: true,
		name: 'directory',
		path: path.join('fixtures', 'directory'),
		...options
	});
}
