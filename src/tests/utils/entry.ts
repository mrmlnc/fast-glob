import * as path from 'path';

import { Dirent, Stats } from '@nodelib/fs.macchiato';

import { Entry } from '../../types';

class EntryBuilder {
	private _isFile: boolean = true;
	private _isDirectory: boolean = false;
	private _isSymbolicLink: boolean = false;

	private readonly _entry: Entry = {
		base: '',
		name: '',
		path: '',
		dirent: new Dirent()
	};

	public path(filepath: string): this {
		this._entry.name = path.basename(filepath);
		this._entry.path = filepath;

		return this;
	}

	public file(): this {
		this._isFile = true;
		this._isDirectory = false;

		return this;
	}

	public directory(): this {
		this._isDirectory = true;
		this._isFile = false;

		return this;
	}

	public symlink(): this {
		this._isSymbolicLink = true;

		return this;
	}

	public stats(): this {
		this._entry.stats = new Stats();

		return this;
	}

	public build(): Entry {
		this._entry.dirent = new Dirent({
			name: this._entry.name,
			isFile: this._isFile,
			isDirectory: this._isDirectory,
			isSymbolicLink: this._isSymbolicLink
		});

		return this._entry;
	}
}

export function builder(): EntryBuilder {
	return new EntryBuilder();
}
