import Settings from '../../settings';
import { Entry, EntryFilterFunction, MicromatchOptions, Pattern, PatternRe } from '../../types';
import * as utils from '../../utils';

type PatternsRegexSet = {
	positive: {
		all: PatternRe[];
	};
	negative: {
		absolute: PatternRe[];
		relative: PatternRe[];
	};
};

export default class EntryFilter {
	public readonly index: Map<string, undefined> = new Map();

	constructor(private readonly _settings: Settings, private readonly _micromatchOptions: MicromatchOptions) {}

	public getFilter(positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const [absoluteNegative, relativeNegative] = utils.pattern.partitionAbsoluteAndRelative(negative);

		const patterns: PatternsRegexSet = {
			positive: {
				all: utils.pattern.convertPatternsToRe(positive, this._micromatchOptions)
			},
			negative: {
				absolute: utils.pattern.convertPatternsToRe(absoluteNegative, { ...this._micromatchOptions, dot: true }),
				relative: utils.pattern.convertPatternsToRe(relativeNegative, { ...this._micromatchOptions, dot: true })
			}
		};

		return (entry) => this._filter(entry, patterns);
	}

	private _filter(entry: Entry, patterns: PatternsRegexSet): boolean {
		const filepath = utils.path.removeLeadingDotSegment(entry.path);

		if (this._settings.unique && this._isDuplicateEntry(filepath)) {
			return false;
		}

		if (this._onlyFileFilter(entry) || this._onlyDirectoryFilter(entry)) {
			return false;
		}

		const isMatched = this._isMatchToPatternsSet(filepath, patterns, entry.dirent.isDirectory());

		if (this._settings.unique && isMatched) {
			this._createIndexRecord(filepath);
		}

		return isMatched;
	}

	private _isDuplicateEntry(filepath: string): boolean {
		return this.index.has(filepath);
	}

	private _createIndexRecord(filepath: string): void {
		this.index.set(filepath, undefined);
	}

	private _onlyFileFilter(entry: Entry): boolean {
		return this._settings.onlyFiles && !entry.dirent.isFile();
	}

	private _onlyDirectoryFilter(entry: Entry): boolean {
		return this._settings.onlyDirectories && !entry.dirent.isDirectory();
	}

	private _isMatchToPatternsSet(filepath: string, patterns: PatternsRegexSet, isDirectory: boolean): boolean {
		const isMatched = this._isMatchToPatterns(filepath, patterns.positive.all, isDirectory);
		if (!isMatched) {
			return false;
		}

		const isMatchedByRelativeNegative = this._isMatchToPatterns(filepath, patterns.negative.relative, isDirectory);
		if (isMatchedByRelativeNegative) {
			return false;
		}

		const isMatchedByAbsoluteNegative = this._isMatchToAbsoluteNegative(filepath, patterns.negative.absolute, isDirectory);
		if (isMatchedByAbsoluteNegative) {
			return false;
		}

		return true;
	}

	private _isMatchToAbsoluteNegative(filepath: string, patternsRe: PatternRe[], isDirectory: boolean): boolean {
		if (patternsRe.length === 0) {
			return false;
		}

		const fullpath = utils.path.makeAbsolute(this._settings.cwd, filepath);

		return this._isMatchToPatterns(fullpath, patternsRe, isDirectory);
	}

	private _isMatchToPatterns(filepath: string, patternsRe: PatternRe[], isDirectory: boolean): boolean {
		if (patternsRe.length === 0) {
			return false;
		}

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
