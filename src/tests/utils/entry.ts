import * as path from 'path';

import { Dirent, DirentType, Stats } from '@nodelib/fs.macchiato';

import type { Entry } from '../../types';

class EntryBuilder {
	private _entryType: DirentType = DirentType.Unknown;

	private readonly _entry: Entry = {
		name: '',
		path: '',
		dirent: new Dirent(),
	};

	public path(filepath: string): this {
		this._entry.name = path.basename(filepath);
		this._entry.path = filepath;

		return this;
	}

	public file(): this {
		this._entryType = DirentType.File;

		return this;
	}

	public directory(): this {
		this._entryType = DirentType.Directory;

		return this;
	}

	public symlink(): this {
		this._entryType = DirentType.Link;

		return this;
	}

	public stats(): this {
		this._entry.stats = new Stats();

		return this;
	}

	public build(): Entry {
		this._entry.dirent = new Dirent(this._entry.name, this._entryType);

		return this._entry;
	}
}

export function builder(): EntryBuilder {
	return new EntryBuilder();
}
