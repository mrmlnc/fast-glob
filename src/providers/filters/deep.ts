import { Entry, MicromatchOptions, EntryFilterFunction, Pattern, PatternRe } from '../../types';
import Settings from '../../settings';
import * as utils from '../../utils';
import PartialMatcher from '../matchers/partial';

export default class DeepFilter {
	constructor(private readonly _settings: Settings, private readonly _micromatchOptions: MicromatchOptions) { }

	public getFilter(basePath: string, positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const matcher = this._getMatcher(positive);
		const negativeRe = this._getNegativePatternsRe(negative);

		return (entry) => this._filter(basePath, entry, matcher, negativeRe);
	}

	private _getMatcher(patterns: Pattern[]): PartialMatcher {
		return new PartialMatcher(patterns, this._settings, this._micromatchOptions);
	}

	private _getNegativePatternsRe(patterns: Pattern[]): PatternRe[] {
		const affectDepthOfReadingPatterns = patterns.filter(utils.pattern.isAffectDepthOfReadingPattern);

		return utils.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this._micromatchOptions);
	}

	private _filter(basePath: string, entry: Entry, matcher: PartialMatcher, negativeRe: PatternRe[]): boolean {
		const depth = this._getEntryLevel(basePath, entry.path);

		if (this._isSkippedByDeep(depth)) {
			return false;
		}

		if (this._isSkippedSymbolicLink(entry)) {
			return false;
		}

		const filepath = utils.path.removeLeadingDotSegment(entry.path);

		if (this._isSkippedByPositivePatterns(filepath, matcher)) {
			return false;
		}

		return this._isSkippedByNegativePatterns(filepath, negativeRe);
	}

	private _isSkippedByDeep(entryDepth: number): boolean {
		return entryDepth >= this._settings.deep;
	}

	private _isSkippedSymbolicLink(entry: Entry): boolean {
		return !this._settings.followSymbolicLinks && entry.dirent.isSymbolicLink();
	}

	private _getEntryLevel(basePath: string, entryPath: string): number {
		const basePathDepth = basePath.split('/').length;
		const entryPathDepth = entryPath.split('/').length;

		return entryPathDepth - (basePath === '' ? 0 : basePathDepth);
	}

	private _isSkippedByPositivePatterns(entryPath: string, matcher: PartialMatcher): boolean {
		return !this._settings.baseNameMatch && !matcher.match(entryPath);
	}

	private _isSkippedByNegativePatterns(entryPath: string, negativeRe: PatternRe[]): boolean {
		return !utils.pattern.matchAny(entryPath, negativeRe);
	}
}
