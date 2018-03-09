import micromatch = require('micromatch');

import * as arrayUtils from '../../utils/array';
import * as pathUtils from '../../utils/path';
import * as patternUtils from '../../utils/pattern';

import { IOptions } from '../../managers/options';

import { FilterFunction } from '@mrmlnc/readdir-enhanced';
import { Entry } from '../../types/entries';
import { Pattern, PatternRe } from '../../types/patterns';

export default class DeepFilter {
	constructor(private readonly options: IOptions, private readonly micromatchOptions: micromatch.Options) { }

	/**
	 * Returns filter for directories.
	 */
	public getFilter(positive: Pattern[], negative: Pattern[]): FilterFunction {
		const maxPatternDepth = this.getMaxPatternDepth(positive);
		const negativeRe: PatternRe[] = patternUtils.convertPatternsToRe(negative, this.micromatchOptions);

		return (entry: Entry) => this.filter(entry, negativeRe, maxPatternDepth);
	}

	/**
	 * Returns max depth of the provided patterns.
	 */
	private getMaxPatternDepth(patterns: Pattern[]): number {
		const globstar = patterns.some(patternUtils.hasGlobStar);
		const patternDepths = patterns.map(patternUtils.getDepth);

		return globstar ? Infinity : arrayUtils.max(patternDepths);
	}

	/**
	 * Returns «true» for directory that should be readed.
	 */
	private filter(entry: Entry, negativeRe: PatternRe[], maxPatternDepth: number): boolean {
		if (this.isSkippedByNestingLevel(entry.depth, maxPatternDepth)) {
			return false;
		}

		// Skip reading if the directory is symlink and we don't want expand symlinks
		if (this.isFollowedSymlink(entry)) {
			return false;
		}

		// Skip reading if the directory name starting with a period and is not expected
		if (this.isFollowedDotDirectory(entry)) {
			return false;
		}

		// Skip by negative patterns
		if (patternUtils.matchAny(entry.path, negativeRe)) {
			return false;
		}

		return true;
	}

	/**
	 * Returns «true» when the directory can be skipped by nesting level.
	 */
	private isSkippedByNestingLevel(entryDepth: number, maxPatternDepth: number): boolean {
		return this.isSkippedByDeepOption(entryDepth) || this.isSkippedByMaxPatternDepth(entryDepth, maxPatternDepth);
	}

	/**
	 * Returns «true» when the «deep» option is disabled or number and depth of the entry is greater that the option value.
	 */
	private isSkippedByDeepOption(entryDepth: number): boolean {
		return !this.options.deep || (typeof this.options.deep === 'number' && entryDepth > this.options.deep);
	}

	/**
	 * Returns «true» when depth parameter is not an Infinity and entry depth greater that the parameter value.
	 */
	private isSkippedByMaxPatternDepth(entryDepth: number, maxPatternDepth: number): boolean {
		return maxPatternDepth !== Infinity && entryDepth > maxPatternDepth;
	}

	/**
	 * Returns «true» for dot directories if the «dot» option is enabled.
	 */
	private isFollowedDotDirectory(entry: Entry): boolean {
		return !this.options.dot && pathUtils.isDotDirectory(entry.path);
	}

	/**
	 * Returns «true» for symlinked directories if the «followSymlinks» option is enabled.
	 */
	private isFollowedSymlink(entry: Entry): boolean {
		return !this.options.followSymlinkedDirectories && entry.isSymbolicLink();
	}
}
