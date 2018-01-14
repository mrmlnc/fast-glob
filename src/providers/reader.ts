import * as path from 'path';

import micromatch = require('micromatch');

import { IOptions } from '../managers/options';
import { ITask } from '../managers/tasks';

import { IEntry, IReaddirOptions } from 'readdir-enhanced';
import { Pattern } from '../types/patterns';

export default abstract class Reader {
	constructor(public readonly options: IOptions) { }

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
	 * Returns true if entry must be added to result.
	 */
	public filter(entry: IEntry, patterns: Pattern[], negative: Pattern[]): boolean {
		// Mark directory by the final slash. Need to micromatch to support «directory/**» patterns
		if (entry.isDirectory()) {
			entry.path += '/';
		}

		// Filter directories that will be excluded by deep filter
		if (entry.isDirectory() && micromatch.any(entry.path, negative)) {
			return false;
		}

		// Filter files and directories by options
		if (this.onlyFileFilter(entry) || this.onlyDirectoryFilter(entry)) {
			return false;
		}

		// Filter by patterns
		const entries = micromatch([entry.path], patterns, { dot: this.options.dot });

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

		// Skip reading if the directory name starting with a period and is not expected
		if (this.isFollowedDotDirectory(entry)) {
			return false;
		}

		return !micromatch.any(entry.path, negative);
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
}
