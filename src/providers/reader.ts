import * as path from 'path';

import micromatch = require('micromatch');

import { IOptions } from '../managers/options';
import { ITask } from '../managers/tasks';

import { IEntry, IReaddirOptions } from 'readdir-enhanced';
import { Entry, EntryItem } from '../types/entries';
import { Pattern } from '../types/patterns';

export default abstract class Reader {
	public readonly index: Map<string, undefined> = new Map();

	private readonly micromatchOptions: micromatch.Options;

	constructor(public readonly options: IOptions) {
		this.micromatchOptions = this.getMicromatchOptions();
	}

	/**
	 * The main logic of reading the directories that must be implemented by each providers.
	 */
	public abstract read(_task: ITask): any; /* tslint:disable-line no-any */

	/**
	 * Returns root path to scanner.
	 */
	public getRootDirectory(task: ITask): string {
		return path.resolve(this.options.cwd, task.base);
	}

	/**
	 * Returns options for reader.
	 */
	public getReaderOptions(task: ITask): IReaddirOptions {
		return {
			basePath: task.base === '.' ? '' : task.base,
			filter: (entry) => this.filter(entry, task.patterns, task.negative),
			deep: (entry) => this.deep(entry, task.negative),
			sep: '/'
		};
	}

	/**
	 * Returns options for micromatch.
	 */
	public getMicromatchOptions(): micromatch.Options {
		return {
			dot: this.options.dot,
			nobrace: this.options.nobrace,
			noglobstar: this.options.noglobstar,
			noext: this.options.noext,
			nocase: this.options.nocase,
			matchBase: this.options.matchBase
		};
	}

	/**
	 * Returns true if entry must be added to result.
	 */
	public filter(entry: IEntry, patterns: Pattern[], negative: Pattern[]): boolean {
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
	 * Returns true if directory must be read.
	 */
	public deep(entry: IEntry, negative: Pattern[]): boolean {
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

		return !micromatch.any(entry.path, negative, this.micromatchOptions);
	}

	/**
	 * Returns transformed entry.
	 */
	public transform(entry: Entry): EntryItem {
		const item: EntryItem = this.options.stats ? entry : entry.path;

		if (this.options.transform === null) {
			return item;
		}

		return this.options.transform(item);
	}

	/**
	 * Returns true if error has ENOENT code.
	 */
	public isEnoentCodeError(err: NodeJS.ErrnoException): boolean {
		return err.code === 'ENOENT';
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
	 * Return true if the entry already has in the cross reader index.
	 */
	public isDuplicateEntry(entry: IEntry): boolean {
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
