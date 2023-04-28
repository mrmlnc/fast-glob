import * as path from 'path';

import { Dirent, DirentType, Stats } from '@nodelib/fs.macchiato';

import type { Entry } from '../../types';

class EntryBuilder {
	#entryType: DirentType = DirentType.Unknown;

	readonly #entry: Entry = {
		name: '',
		path: '',
		dirent: new Dirent(),
	};

	public path(filepath: string): this {
		this.#entry.name = path.basename(filepath);
		this.#entry.path = filepath;

		return this;
	}

	public file(): this {
		this.#entryType = DirentType.File;

		return this;
	}

	public directory(): this {
		this.#entryType = DirentType.Directory;

		return this;
	}

	public symlink(): this {
		this.#entryType = DirentType.Link;

		return this;
	}

	public stats(): this {
		this.#entry.stats = new Stats();

		return this;
	}

	public build(): Entry {
		this.#entry.dirent = new Dirent(this.#entry.name, this.#entryType);

		return this.#entry;
	}
}

export function builder(): EntryBuilder {
	return new EntryBuilder();
}
