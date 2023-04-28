import * as utils from '../../utils';

import type Settings from '../../settings';
import type { Entry, EntryItem, EntryTransformerFunction } from '../../types';

export default class EntryTransformer {
	readonly #settings: Settings;

	constructor(settings: Settings) {
		this.#settings = settings;
	}

	public getTransformer(): EntryTransformerFunction {
		return (entry) => this.#transform(entry);
	}

	#transform(entry: Entry): EntryItem {
		let filepath = entry.path;

		if (this.#settings.absolute) {
			filepath = utils.path.makeAbsolute(this.#settings.cwd, filepath);
			filepath = utils.path.unixify(filepath);
		}

		if (this.#settings.markDirectories && entry.dirent.isDirectory()) {
			filepath += '/';
		}

		if (!this.#settings.objectMode) {
			return filepath;
		}

		return {
			...entry,
			path: filepath,
		};
	}
}
