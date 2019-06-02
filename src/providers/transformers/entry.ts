import * as path from 'path';

import Settings from '../../settings';
import { Entry, EntryItem, EntryTransformerFunction } from '../../types';
import * as utils from '../../utils/index';

export default class EntryTransformer {
	constructor(private readonly _settings: Settings) { }

	public getTransformer(): EntryTransformerFunction {
		return (entry) => this._transform(entry);
	}

	private _transform(entry: Entry): EntryItem {
		if (this._settings.absolute) {
			entry.path = utils.path.makeAbsolute(this._settings.cwd, entry.path);
		}

		if (this._settings.markDirectories && entry.dirent.isDirectory()) {
			entry.path += path.sep;
		}

		entry.path = utils.path.unixify(entry.path);

		const item = this._settings.stats ? entry : entry.path;

		if (this._settings.transform === null) {
			return item;
		}

		return this._settings.transform(item);
	}
}
