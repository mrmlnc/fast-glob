import Settings from '../../settings';
import { Entry, EntryFilterFunction, MicromatchOptions, Pattern, PatternRe } from '../../types';
import * as utils from '../../utils';

export default class EntryFilter {
	public readonly index: Map<string, undefined> = new Map();

	constructor(private readonly _settings: Settings, private readonly _micromatchOptions: MicromatchOptions) {}

	public getFilter(positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const positiveRe = utils.pattern.convertPatternsToRe(positive, this._micromatchOptions);
		const negativeRe = utils.pattern.convertPatternsToRe(negative, {
			...this._micromatchOptions,
			dot: true
		});

		return (entry) => this._filter(entry, positiveRe, negativeRe);
	}

	private _filter(entry: Entry, positiveRe: PatternRe[], negativeRe: PatternRe[]): boolean {
		if (this._settings.unique && this._isDuplicateEntry(entry)) {
			return false;
		}

		if (this._onlyFileFilter(entry) || this._onlyDirectoryFilter(entry)) {
			return false;
		}

		if (this._isSkippedByAbsoluteNegativePatterns(entry.path, negativeRe)) {
			return false;
		}

		const isDirectory = entry.dirent.isDirectory();

		const isMatched = this._isMatchToPatterns(entry.path, positiveRe, isDirectory) && !this._isMatchToPatterns(entry.path, negativeRe, isDirectory);

		if (this._settings.unique && isMatched) {
			this._createIndexRecord(entry);
		}

		return isMatched;
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

	private _isSkippedByAbsoluteNegativePatterns(entryPath: string, patternsRe: PatternRe[]): boolean {
		if (!this._settings.absolute) {
			return false;
		}

		const fullpath = utils.path.makeAbsolute(this._settings.cwd, entryPath);

		return utils.pattern.matchAny(fullpath, patternsRe);
	}

	private _isMatchToPatterns(entryPath: string, patternsRe: PatternRe[], isDirectory: boolean): boolean {
		const filepath = utils.path.removeLeadingDotSegment(entryPath);

		// Trying to match files and directories by patterns.
		const isMatched = utils.pattern.matchAny(filepath, patternsRe);

		// A pattern with a trailling slash can be used for directory matching.
		// To apply such pattern, we need to add a tralling slash to the path.
		if (!isMatched && isDirectory) {
			return utils.pattern.matchAny(filepath + '/', patternsRe);
		}

		return isMatched;
	}
}
