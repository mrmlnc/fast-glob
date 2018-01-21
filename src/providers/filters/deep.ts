import micromatch = require('micromatch');

import * as arrayUtils from '../../utils/array';
import * as pathUtils from '../../utils/path';
import * as patternUtils from '../../utils/pattern';

import { IOptions } from '../../managers/options';

import { FilterFunction } from 'readdir-enhanced';
import { IEntry } from '../../types/entries';
import { Pattern, PatternRe } from '../../types/patterns';

export default class DeepFilter {
	constructor(private readonly options: IOptions, private readonly micromatchOptions: micromatch.Options) { }

	/**
	 * Returns filter for directories.
	 */
	public getFilter(positive: Pattern[], negative: Pattern[]): FilterFunction {
		const depth = this.getMaxDeth(positive);
		const negativeRe: PatternRe[] = patternUtils.convertPatternsToRe(negative, this.micromatchOptions);

		return (entry: IEntry) => this.filter(entry, negativeRe, depth);
	}

	/**
	 * Returns true if directory must be read.
	 */
	private filter(entry: IEntry, negativeRe: PatternRe[], depth: number): boolean {
		// Skip reading, depending on the nesting level
		if (!this.options.deep || this.skipByDeepOption(entry) || this.skipByPatternDepth(entry, depth)) {
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
	 * Returns max depth for reading.
	 */
	private getMaxDeth(positive: Pattern[]): number {
		const globstar = positive.some(patternUtils.hasGlobStar);
		const patternDepths = positive.map(patternUtils.getDepth);

		return globstar ? Infinity : arrayUtils.max(patternDepths);
	}

	/**
	 * Returns true for dot directories if the «dot» option is enabled.
	 */
	private isFollowedDotDirectory(entry: IEntry): boolean {
		return !this.options.dot && pathUtils.isDotDirectory(entry.path);
	}

	/**
	 * Returns true for symlinked directories if the «followSymlinks» option is enabled.
	 */
	private isFollowedSymlink(entry: IEntry): boolean {
		return !this.options.followSymlinkedDirectories && entry.isSymbolicLink();
	}

	/**
	 * Returns true when the «deep» options is number and entry depth greater that the option value.
	 */
	private skipByDeepOption(entry: IEntry): boolean {
		return typeof this.options.deep === 'number' && entry.depth > this.options.deep;
	}

	/**
	 * Return true when depth parameter is not an Infinity and entry depth greater that the parameter value.
	 */
	private skipByPatternDepth(entry: IEntry, depth: number): boolean {
		return depth !== Infinity && entry.depth > depth;
	}
}
