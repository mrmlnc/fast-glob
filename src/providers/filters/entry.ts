import micromatch = require('micromatch');

import * as patternUtils from '../../utils/pattern';

import { IOptions } from '../../managers/options';

import { FilterFunction } from 'readdir-enhanced';
import { IEntry } from '../../types/entries';
import { Pattern, PatternRe } from '../../types/patterns';

export default class DeepFilter {
	public readonly index: Map<string, undefined> = new Map();

	constructor(private readonly options: IOptions, private readonly micromatchOptions: micromatch.Options) { }

	/**
	 * Returns filter for directories.
	 */
	public getFilter(positive: Pattern[], negative: Pattern[]): FilterFunction {
		const positiveRe: PatternRe[] = patternUtils.convertPatternsToRe(positive, this.micromatchOptions);
		const negativeRe: PatternRe[] = patternUtils.convertPatternsToRe(negative, this.micromatchOptions);

		return (entry: IEntry) => this.filter(entry, positiveRe, negativeRe);
	}

	/**
	 * Returns true if entry must be added to result.
	 */
	private filter(entry: IEntry, positiveRe: PatternRe[], negativeRe: PatternRe[]): boolean {
		// Exclude duplicate results
		if (this.options.unique) {
			if (this.isDuplicateEntry(entry)) {
				return false;
			}

			this.createIndexRecord(entry);
		}

		// Mark directory by the final slash. Need to micromatch to support «directory/**» patterns
		if (entry.isDirectory()) {
			entry.path += '/';
		}

		// Filter directories that will be excluded by deep filter
		if (entry.isDirectory() && patternUtils.matchAny(entry.path, negativeRe)) {
			return false;
		}

		// Filter files and directories by options
		if (this.onlyFileFilter(entry) || this.onlyDirectoryFilter(entry)) {
			return false;
		}

		return patternUtils.match(entry.path, positiveRe, negativeRe);
	}

	/**
	 * Return true if the entry already has in the cross reader index.
	 */
	private isDuplicateEntry(entry: IEntry): boolean {
		return this.index.has(entry.path);
	}

	/**
	 * Create record in the cross reader index.
	 */
	private createIndexRecord(entry: IEntry): void {
		this.index.set(entry.path, undefined);
	}

	/**
	 * Returns true for non-files if the «onlyFiles» option is enabled.
	 */
	private onlyFileFilter(entry: IEntry): boolean {
		return this.options.onlyFiles && !entry.isFile();
	}

	/**
	 * Returns true for non-directories if the «onlyDirectories» option is enabled.
	 */
	private onlyDirectoryFilter(entry: IEntry): boolean {
		return this.options.onlyDirectories && !entry.isDirectory();
	}
}
