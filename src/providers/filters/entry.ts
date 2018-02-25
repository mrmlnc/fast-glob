import micromatch = require('micromatch');

import * as patternUtils from '../../utils/pattern';

import { IOptions } from '../../managers/options';

import { FilterFunction } from '@mrmlnc/readdir-enhanced';
import { Entry } from '../../types/entries';
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

		return (entry: Entry) => this.filter(entry, positiveRe, negativeRe);
	}

	/**
	 * Returns true if entry must be added to result.
	 */
	private filter(entry: Entry, positiveRe: PatternRe[], negativeRe: PatternRe[]): boolean {
		let entryPath: string = entry.path;

		// Exclude duplicate results
		if (this.options.unique) {
			if (this.isDuplicateEntry(entry)) {
				return false;
			}

			this.createIndexRecord(entry);
		}

		// Mark directory by the final slash. Need to micromatch to support «directory/**» patterns
		if (entry.isDirectory()) {
			entryPath += '/';
		}

		// Filter directories that will be excluded by deep filter
		if (entry.isDirectory() && patternUtils.matchAny(entryPath, negativeRe)) {
			return false;
		}

		// Filter files and directories by options
		if (this.onlyFileFilter(entry) || this.onlyDirectoryFilter(entry)) {
			return false;
		}

		return patternUtils.match(entryPath, positiveRe, negativeRe);
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
		return this.options.onlyFiles && !entry.isFile();
	}

	/**
	 * Returns true for non-directories if the «onlyDirectories» option is enabled.
	 */
	private onlyDirectoryFilter(entry: Entry): boolean {
		return this.options.onlyDirectories && !entry.isDirectory();
	}
}
