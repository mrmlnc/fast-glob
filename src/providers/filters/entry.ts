import Settings from '../../settings';
import { Entry, EntryFilterFunction, MicromatchOptions, Pattern, PatternRe } from '../../types';
import * as utils from '../../utils';

export default class EntryFilter {
	public readonly index: Map<string, undefined> = new Map();

	constructor(private readonly _settings: Settings, private readonly _micromatchOptions: MicromatchOptions) { }

	public getFilter(positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const positiveRe = utils.pattern.convertPatternsToRe(positive, this._micromatchOptions);
		const negativeRe = utils.pattern.convertPatternsToRe(negative, this._micromatchOptions);

		return (entry) => this._filter(entry, positiveRe, negativeRe);
	}

	private _filter(entry: Entry, positiveRe: PatternRe[], negativeRe: PatternRe[]): boolean {
		if (this._settings.unique) {
			if (this._isDuplicateEntry(entry)) {
				return false;
			}

			this._createIndexRecord(entry);
		}

		if (this._onlyFileFilter(entry) || this._onlyDirectoryFilter(entry)) {
			return false;
		}

		if (this._isSkippedByAbsoluteNegativePatterns(entry, negativeRe)) {
			return false;
		}

		const filepath = this._settings.baseNameMatch ? entry.name : entry.path;

		return this._isMatchToPatterns(filepath, positiveRe) && !this._isMatchToPatterns(entry.path, negativeRe);
	}

	private _isDuplicateEntry(entry: Entry): boolean {
		return this.index.has(entry.path);
	}

	private _createIndexRecord(entry: Entry): void {
		this.index.set(entry.path, undefined);
	}

	private _onlyFileFilter(entry: Entry): boolean {
		return this._settings.onlyFiles && !entry.dirent.isFile();
	}

	private _onlyDirectoryFilter(entry: Entry): boolean {
		return this._settings.onlyDirectories && !entry.dirent.isDirectory();
	}

	private _isSkippedByAbsoluteNegativePatterns(entry: Entry, negativeRe: PatternRe[]): boolean {
		if (!this._settings.absolute) {
			return false;
		}

		const fullpath = utils.path.makeAbsolute(this._settings.cwd, entry.path);

		return this._isMatchToPatterns(fullpath, negativeRe);
	}

	private _isMatchToPatterns(entryPath: string, patternsRe: PatternRe[]): boolean {
		const filepath = utils.path.removeLeadingDotSegment(entryPath);

		return utils.pattern.matchAny(filepath, patternsRe);
	}
}
