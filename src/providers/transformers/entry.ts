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
			entry.path = utils.path.unixify(entry.path);
		}

		if (this._settings.markDirectories && entry.dirent.isDirectory()) {
			entry.path += '/';
		}

		if (this._settings.objectMode) {
			return entry;
		}

		return entry.path;
	}
}
