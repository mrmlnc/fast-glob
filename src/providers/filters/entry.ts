import micromatch = require('micromatch');

import { IOptions } from '../../managers/options';

import { IEntry } from '../../types/entries';
import { Pattern } from '../../types/patterns';

export default class DeepFilter {
	public readonly index: Map<string, undefined> = new Map();

	constructor(private readonly options: IOptions, private readonly micromatchOptions: micromatch.Options) { }

	/**
	 * Returns true if entry must be added to result.
	 */
	public call(entry: IEntry, patterns: Pattern[], negative: Pattern[]): boolean {
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
		if (entry.isDirectory() && micromatch.any(entry.path, negative, this.micromatchOptions)) {
			return false;
		}

		// Filter files and directories by options
		if (this.onlyFileFilter(entry) || this.onlyDirectoryFilter(entry)) {
			return false;
		}

		// Filter by patterns
		const entries = micromatch([entry.path], patterns, this.micromatchOptions);

		return entries.length !== 0;
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
