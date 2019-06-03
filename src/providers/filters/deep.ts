import * as path from 'path';

import Settings from '../../settings';
import { Entry, EntryFilterFunction, MicromatchOptions, Pattern, PatternRe } from '../../types/index';
import * as utils from '../../utils/index';

export default class DeepFilter {
	constructor(private readonly _settings: Settings, private readonly _micromatchOptions: MicromatchOptions) { }

	public getFilter(basePath: string, positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const maxPatternDepth = this._getMaxPatternDepth(positive);
		const negativeRe = this._getNegativePatternsRe(negative);

		return (entry) => this._filter(basePath, entry, negativeRe, maxPatternDepth);
	}

	private _getMaxPatternDepth(patterns: Pattern[]): number {
		const globstar = patterns.some(utils.pattern.hasGlobStar);

		return globstar ? Infinity : utils.pattern.getMaxNaivePatternsDepth(patterns);
	}

	private _getNegativePatternsRe(patterns: Pattern[]): PatternRe[] {
		const affectDepthOfReadingPatterns = patterns.filter(utils.pattern.isAffectDepthOfReadingPattern);

		return utils.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this._micromatchOptions);
	}

	private _filter(basePath: string, entry: Entry, negativeRe: PatternRe[], maxPatternDepth: number): boolean {
		const depth = this._getEntryDepth(basePath, entry.path);

		if (this._isSkippedByDeep(depth)) {
			return false;
		}

		if (this._isSkippedByMaxPatternDepth(depth, maxPatternDepth)) {
			return false;
		}

		if (this._isSkippedSymbolicLink(entry)) {
			return false;
		}

		if (this._isSkippedDotDirectory(entry)) {
			return false;
		}

		return this._isSkippedByNegativePatterns(entry, negativeRe);
	}

	private _getEntryDepth(basePath: string, entryPath: string): number {
		const basePathDepth = basePath.split(path.sep).length;
		const entryPathDepth = entryPath.split(path.sep).length;

		return entryPathDepth - (basePath === '' ? 0 : basePathDepth);
	}

	private _isSkippedByDeep(entryDepth: number): boolean {
		return !this._settings.deep || (typeof this._settings.deep === 'number' && entryDepth >= this._settings.deep);
	}

	private _isSkippedByMaxPatternDepth(entryDepth: number, maxPatternDepth: number): boolean {
		return maxPatternDepth !== Infinity && entryDepth > maxPatternDepth;
	}

	private _isSkippedSymbolicLink(entry: Entry): boolean {
		return !this._settings.followSymbolicLinks && entry.dirent.isSymbolicLink();
	}

	private _isSkippedDotDirectory(entry: Entry): boolean {
		return !this._settings.dot && entry.name.startsWith('.');
	}

	private _isSkippedByNegativePatterns(entry: Entry, negativeRe: PatternRe[]): boolean {
		return !utils.pattern.matchAny(entry.path, negativeRe);
	}
}
