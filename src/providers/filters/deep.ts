import micromatch = require('micromatch');

import { IOptions } from '../../managers/options';

import { IEntry } from '../../types/entries';
import { Pattern } from '../../types/patterns';

export default class DeepFilter {
	constructor(private readonly options: IOptions, private readonly micromatchOptions: micromatch.Options) { }

	/**
	 * Returns true if directory must be read.
	 */
	public call(entry: IEntry, negative: Pattern[], globstar: boolean): boolean {
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

		if (micromatch.any(entry.path, negative, this.micromatchOptions)) {
			return false;
		}

		return globstar;
	}

	/**
	 * Returns true if the last partial of the path starting with a period.
	 */
	public isDotDirectory(entry: IEntry): boolean {
		const pathPartials = entry.path.split('/');
		const lastPathPartial: string = pathPartials[pathPartials.length - 1];

		return lastPathPartial.startsWith('.');
	}

	/**
	 * Returns true for dot directories if the «dot» option is enabled.
	 */
	private isFollowedDotDirectory(entry: IEntry): boolean {
		return !this.options.dot && this.isDotDirectory(entry);
	}

	/**
	 * Returns true for symlinked directories if the «followSymlinks» option is enabled.
	 */
	private isFollowedSymlink(entry: IEntry): boolean {
		return !this.options.followSymlinkedDirectories && entry.isSymbolicLink();
	}
}
