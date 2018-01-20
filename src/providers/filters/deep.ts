import micromatch = require('micromatch');

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
	public getFilter(negative: Pattern[], recursive: boolean): FilterFunction {
		const negativeRe: PatternRe[] = patternUtils.convertPatternsToRe(negative, this.micromatchOptions);

		return (entry: IEntry) => this.filter(entry, negativeRe, recursive);
	}

	/**
	 * Returns true if directory must be read.
	 */
	private filter(entry: IEntry, negativeRe: PatternRe[], recursive: boolean): boolean {
		if (!this.options.deep) {
			return false;
		}

		// Skip reading, depending on the nesting level
		if (typeof this.options.deep === 'number') {
			if (entry.depth > this.options.deep) {
				return false;
			}
		}

		// Skip reading if the directory is symlink and we don't want expand symlinks
		if (this.isFollowedSymlink(entry)) {
			return false;
		}

		// Skip reading if the directory name starting with a period and is not expected
		if (this.isFollowedDotDirectory(entry)) {
			return false;
		}

		if (patternUtils.matchAny(entry.path, negativeRe)) {
			return false;
		}

		return recursive;
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
}
