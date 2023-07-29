import * as path from 'node:path';

import * as utils from '../../utils';

import type Settings from '../../settings';
import type { Entry, EntryItem, EntryTransformerFunction } from '../../types';

export default class EntryTransformer {
	readonly #settings: Settings;
	readonly #pathSeparatorSymbol: string;

	constructor(settings: Settings) {
		this.#settings = settings;

		this.#pathSeparatorSymbol = this.#getPathSeparatorSymbol();
	}

	public getTransformer(): EntryTransformerFunction {
		return (entry) => this.#transform(entry);
	}

	#transform(entry: Entry): EntryItem {
		let filepath = entry.path;

		if (this.#settings.absolute) {
			filepath = utils.path.makeAbsolute(this.#settings.cwd, filepath);
			filepath = utils.string.flatHeavilyConcatenatedString(filepath);
		}

		if (this.#settings.markDirectories && entry.dirent.isDirectory()) {
			filepath += this.#pathSeparatorSymbol;
		}

		if (!this.#settings.objectMode) {
			return filepath;
		}

		return {
			...entry,
			path: filepath,
		};
	}

	#getPathSeparatorSymbol(): string {
		return this.#settings.absolute ? path.sep : '/';
	}
}
