import Settings from '../../settings';
import { Entry, EntryItem, EntryTransformerFunction } from '../../types';
import * as utils from '../../utils/index';

export default class EntryTransformer {
	constructor(private readonly _settings: Settings) { }

	public getTransformer(basePath: string): EntryTransformerFunction {
		return (entry) => this._transform(basePath, entry);
	}

	private _transform(basePath: string, entry: Entry): EntryItem {
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
			base: basePath,
			path: filepath
		};
	}
}
