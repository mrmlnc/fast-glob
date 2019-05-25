import * as path from 'path';

import Settings from '../../settings';
import { Entry, EntryFilterFunction, MicromatchOptions, Pattern, PatternRe } from '../../types/index';
import * as utils from '../../utils/index';

export default class DeepFilter {
	constructor(private readonly _settings: Settings, private readonly _micromatchOptions: MicromatchOptions) { }

	/**
	 * Returns filter for directories.
	 */
	public getFilter(basePath: string, positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const maxPatternDepth = this._getMaxPatternDepth(positive);
		const negativeRe: PatternRe[] = this._getNegativePatternsRe(negative);

		return (entry: Entry) => this._filter(basePath, entry, negativeRe, maxPatternDepth);
	}

	/**
	 * Returns max depth of the provided patterns.
	 */
	private _getMaxPatternDepth(patterns: Pattern[]): number {
		const globstar = patterns.some(utils.pattern.hasGlobStar);

		return globstar ? Infinity : utils.pattern.getMaxNaivePatternsDepth(patterns);
	}

	/**
	 * Returns RegExp's for patterns that can affect the depth of reading.
	 */
	private _getNegativePatternsRe(patterns: Pattern[]): PatternRe[] {
		const affectDepthOfReadingPatterns: Pattern[] = patterns.filter(utils.pattern.isAffectDepthOfReadingPattern);

		return utils.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this._micromatchOptions);
	}

	/**
	 * Returns «true» for directory that should be read.
	 */
	private _filter(basePath: string, entry: Entry, negativeRe: PatternRe[], maxPatternDepth: number): boolean {
		const basePathDepth = basePath.split(path.posix.sep).length;
		const depth = entry.path.split(path.sep).length - (basePath === '' ? 0 : basePathDepth) - 1;

		if (this._isSkippedByDeepOption(depth)) {
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

	/**
	 * Returns «true» when the «deep» option is disabled or number and depth of the entry is greater that the option value.
	 */
	private _isSkippedByDeepOption(entryDepth: number): boolean {
		return !this._settings.deep || (typeof this._settings.deep === 'number' && entryDepth >= this._settings.deep);
	}

	/**
	 * Returns «true» when depth parameter is not an Infinity and entry depth greater that the parameter value.
	 */
	private _isSkippedByMaxPatternDepth(entryDepth: number, maxPatternDepth: number): boolean {
		return maxPatternDepth !== Infinity && entryDepth >= maxPatternDepth;
	}

	/**
	 * Returns «true» for symbolic link if the «followSymbolicLinks» option is disabled.
	 */
	private _isSkippedSymbolicLink(entry: Entry): boolean {
		return !this._settings.followSymbolicLinks && entry.dirent.isSymbolicLink();
	}

	/**
	 * Returns «true» for a directory whose name starts with a period if «dot» option is disabled.
	 */
	private _isSkippedDotDirectory(entry: Entry): boolean {
		return !this._settings.dot && utils.path.isDotDirectory(entry.path);
	}

	/**
	 * Returns «true» for a directory whose path math to any negative pattern.
	 */
	private _isSkippedByNegativePatterns(entry: Entry, negativeRe: PatternRe[]): boolean {
		return !utils.pattern.matchAny(entry.path, negativeRe);
	}
}
