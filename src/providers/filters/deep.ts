import micromatch = require('micromatch');

import { FilterFunction } from '@mrmlnc/readdir-enhanced';
import Settings from '../../settings';
import { Entry, Pattern, PatternRe } from '../../types/index';
import * as pathUtils from '../../utils/path';
import * as patternUtils from '../../utils/pattern';

export default class DeepFilter {
	constructor(private readonly settings: Settings, private readonly micromatchOptions: micromatch.Options) { }

	/**
	 * Returns filter for directories.
	 */
	public getFilter(positive: Pattern[], negative: Pattern[]): FilterFunction {
		const maxPatternDepth = this.getMaxPatternDepth(positive);
		const negativeRe: PatternRe[] = this.getNegativePatternsRe(negative);

		return (entry: Entry) => this.filter(entry, negativeRe, maxPatternDepth);
	}

	/**
	 * Returns max depth of the provided patterns.
	 */
	private getMaxPatternDepth(patterns: Pattern[]): number {
		const globstar = patterns.some(patternUtils.hasGlobStar);

		return globstar ? Infinity : patternUtils.getMaxNaivePatternsDepth(patterns);
	}

	/**
	 * Returns RegExp's for patterns that can affect the depth of reading.
	 */
	private getNegativePatternsRe(patterns: Pattern[]): PatternRe[] {
		const affectDepthOfReadingPatterns: Pattern[] = patterns.filter(patternUtils.isAffectDepthOfReadingPattern);

		return patternUtils.convertPatternsToRe(affectDepthOfReadingPatterns, this.micromatchOptions);
	}

	/**
	 * Returns «true» for directory that should be read.
	 */
	private filter(entry: Entry, negativeRe: PatternRe[], maxPatternDepth: number): boolean {
		if (this.isSkippedByDeepOption(entry.depth)) {
			return false;
		}

		if (this.isSkippedByMaxPatternDepth(entry.depth, maxPatternDepth)) {
			return false;
		}

		if (this.isSkippedSymlinkedDirectory(entry)) {
			return false;
		}

		if (this.isSkippedDotDirectory(entry)) {
			return false;
		}

		return this.isSkippedByNegativePatterns(entry, negativeRe);
	}

	/**
	 * Returns «true» when the «deep» option is disabled or number and depth of the entry is greater that the option value.
	 */
	private isSkippedByDeepOption(entryDepth: number): boolean {
		return !this.settings.deep || (typeof this.settings.deep === 'number' && entryDepth >= this.settings.deep);
	}

	/**
	 * Returns «true» when depth parameter is not an Infinity and entry depth greater that the parameter value.
	 */
	private isSkippedByMaxPatternDepth(entryDepth: number, maxPatternDepth: number): boolean {
		return maxPatternDepth !== Infinity && entryDepth >= maxPatternDepth;
	}

	/**
	 * Returns «true» for symlinked directory if the «followSymlinkedDirectories» option is disabled.
	 */
	private isSkippedSymlinkedDirectory(entry: Entry): boolean {
		return !this.settings.followSymlinkedDirectories && entry.isSymbolicLink();
	}

	/**
	 * Returns «true» for a directory whose name starts with a period if «dot» option is disabled.
	 */
	private isSkippedDotDirectory(entry: Entry): boolean {
		return !this.settings.dot && pathUtils.isDotDirectory(entry.path);
	}

	/**
	 * Returns «true» for a directory whose path math to any negative pattern.
	 */
	private isSkippedByNegativePatterns(entry: Entry, negativeRe: PatternRe[]): boolean {
		return !patternUtils.matchAny(entry.path, negativeRe);
	}
}
