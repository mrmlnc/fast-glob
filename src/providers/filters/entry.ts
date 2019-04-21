import { FilterFunction } from '@mrmlnc/readdir-enhanced';
import micromatch = require('micromatch');

import Settings from '../../settings';
import { Entry } from '../../types/entries';
import { Pattern, PatternRe } from '../../types/patterns';
import * as pathUtils from '../../utils/path';
import * as patternUtils from '../../utils/pattern';

export default class EntryFilter {
	public readonly index: Map<string, undefined> = new Map();

	constructor(private readonly settings: Settings, private readonly micromatchOptions: micromatch.Options) { }

	/**
	 * Returns filter for directories.
	 */
	public getFilter(positive: Pattern[], negative: Pattern[]): FilterFunction {
		const positiveRe: PatternRe[] = patternUtils.convertPatternsToRe(positive, this.micromatchOptions);
		const negativeRe: PatternRe[] = patternUtils.convertPatternsToRe(negative, this.micromatchOptions);

		return (entry: Entry) => this.filter(entry, positiveRe, negativeRe);
	}

	/**
	 * Returns true if entry must be added to result.
	 */
	private filter(entry: Entry, positiveRe: PatternRe[], negativeRe: PatternRe[]): boolean {
		// Exclude duplicate results
		if (this.settings.unique) {
			if (this.isDuplicateEntry(entry)) {
				return false;
			}

			this.createIndexRecord(entry);
		}

		// Filter files and directories by options
		if (this.onlyFileFilter(entry) || this.onlyDirectoryFilter(entry)) {
			return false;
		}

		if (this.isSkippedByAbsoluteNegativePatterns(entry, negativeRe)) {
			return false;
		}

		return this.isMatchToPatterns(entry.path, positiveRe) && !this.isMatchToPatterns(entry.path, negativeRe);
	}

	/**
	 * Return true if the entry already has in the cross reader index.
	 */
	private isDuplicateEntry(entry: Entry): boolean {
		return this.index.has(entry.path);
	}

	/**
	 * Create record in the cross reader index.
	 */
	private createIndexRecord(entry: Entry): void {
		this.index.set(entry.path, undefined);
	}

	/**
	 * Returns true for non-files if the «onlyFiles» option is enabled.
	 */
	private onlyFileFilter(entry: Entry): boolean {
		return this.settings.onlyFiles && !entry.isFile();
	}

	/**
	 * Returns true for non-directories if the «onlyDirectories» option is enabled.
	 */
	private onlyDirectoryFilter(entry: Entry): boolean {
		return this.settings.onlyDirectories && !entry.isDirectory();
	}

	/**
	 * Return true when `absolute` option is enabled and matched to the negative patterns.
	 */
	private isSkippedByAbsoluteNegativePatterns(entry: Entry, negativeRe: PatternRe[]): boolean {
		if (!this.settings.absolute) {
			return false;
		}

		const fullpath = pathUtils.makeAbsolute(this.settings.cwd, entry.path);

		return this.isMatchToPatterns(fullpath, negativeRe);
	}

	/**
	 * Return true when entry match to provided patterns.
	 *
	 * First, just trying to apply patterns to the path.
	 * Second, trying to apply patterns to the path with final slash (need to micromatch to support «directory/**» patterns).
	 */
	private isMatchToPatterns(filepath: string, patternsRe: PatternRe[]): boolean {
		return patternUtils.matchAny(filepath, patternsRe) || patternUtils.matchAny(filepath + '/', patternsRe);
	}
}
