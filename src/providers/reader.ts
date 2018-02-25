import * as path from 'path';

import micromatch = require('micromatch');

import DeepFilter from './filters/deep';
import EntryFilter from './filters/entry';

import { IOptions } from '../managers/options';
import { ITask } from '../managers/tasks';

import { Options as IReaddirOptions } from '@mrmlnc/readdir-enhanced';
import { Entry, EntryItem } from '../types/entries';

export default abstract class Reader<T> {
	private readonly micromatchOptions: micromatch.Options;

	private readonly entryFilter: EntryFilter;
	private readonly deepFilter: DeepFilter;

	constructor(public readonly options: IOptions) {
		this.micromatchOptions = this.getMicromatchOptions();

		this.entryFilter = new EntryFilter(options, this.micromatchOptions);
		this.deepFilter = new DeepFilter(options, this.micromatchOptions);
	}

	/**
	 * The main logic of reading the directories that must be implemented by each providers.
	 */
	public abstract read(_task: ITask): T;

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
			filter: this.entryFilter.getFilter(task.positive, task.negative),
			deep: this.deepFilter.getFilter(task.positive, task.negative),
			sep: '/'
		};
	}

	/**
	 * Returns options for micromatch.
	 */
	public getMicromatchOptions(): micromatch.Options {
		return {
			dot: this.options.dot,
			nobrace: !this.options.brace,
			noglobstar: !this.options.globstar,
			noext: !this.options.extension,
			nocase: !this.options.case,
			matchBase: this.options.matchBase
		};
	}

	/**
	 * Returns transformed entry.
	 */
	public transform(entry: Entry): EntryItem {
		if (this.options.markDirectories && entry.isDirectory()) {
			entry.path += '/';
		}

		if (this.options.absolute && !path.isAbsolute(entry.path)) {
			entry.path = path.resolve(this.options.cwd, entry.path);
		}

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
}
