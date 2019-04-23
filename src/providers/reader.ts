import * as path from 'path';

import { Options as IReaddirOptions } from '@mrmlnc/readdir-enhanced';
import micromatch = require('micromatch');

import { Task } from '../managers/tasks';
import Settings from '../settings';
import { Entry, EntryItem } from '../types/index';
import * as utils from '../utils/index';
import DeepFilter from './filters/deep';
import EntryFilter from './filters/entry';

export default abstract class Reader<T> {
	public readonly entryFilter: EntryFilter;
	public readonly deepFilter: DeepFilter;

	private readonly micromatchOptions: micromatch.Options;

	constructor(public readonly settings: Settings) {
		this.micromatchOptions = this.getMicromatchOptions();

		this.entryFilter = new EntryFilter(settings, this.micromatchOptions);
		this.deepFilter = new DeepFilter(settings, this.micromatchOptions);
	}

	/**
	 * The main logic of reading the directories that must be implemented by each providers.
	 */
	public abstract read(_task: Task): T;

	/**
	 * Returns root path to scanner.
	 */
	public getRootDirectory(task: Task): string {
		return path.resolve(this.settings.cwd, task.base);
	}

	/**
	 * Returns options for reader.
	 */
	public getReaderOptions(task: Task): IReaddirOptions {
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
			dot: this.settings.dot,
			nobrace: !this.settings.brace,
			noglobstar: !this.settings.globstar,
			noext: !this.settings.extglob,
			nocase: !this.settings.case,
			matchBase: this.settings.matchBase
		};
	}

	/**
	 * Returns transformed entry.
	 */
	public transform(entry: Entry): EntryItem {
		if (this.settings.absolute && !path.isAbsolute(entry.path)) {
			entry.path = utils.path.makeAbsolute(this.settings.cwd, entry.path);
		}

		if (this.settings.markDirectories && entry.isDirectory()) {
			entry.path += '/';
		}

		const item: EntryItem = this.settings.stats ? entry : entry.path;

		if (this.settings.transform === null) {
			return item;
		}

		return this.settings.transform(item);
	}

	/**
	 * Returns true if error has ENOENT code.
	 */
	public isEnoentCodeError(err: NodeJS.ErrnoException): boolean {
		return err.code === 'ENOENT';
	}
}
