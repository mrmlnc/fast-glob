import Settings from '../../settings';
import { Entry, EntryItem, EntryTransformerFunction } from '../../types';
import * as utils from '../../utils';

export default class EntryTransformer {
	constructor(private readonly _settings: Settings) { }

	public getTransformer(): EntryTransformerFunction {
		return (entry) => this._transform(entry);
	}

	private _transform(entry: Entry): EntryItem {
		let filepath = entry.path;

		if (this._settings.absolute) {
			filepath = utils.path.makeAbsolute(this._settings.cwd, filepath);
			filepath = utils.path.unixify(filepath);
		}

		if (this._settings.markDirectories && entry.dirent.isDirectory()) {
			filepath += '/';
		}

		if (!this._settings.objectMode) {
			return filepath;
		}

		return {
			...entry,
			path: filepath,
		};
	}
}
