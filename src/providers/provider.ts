import * as path from 'path';

import { Task } from '../managers/tasks';
import Settings from '../settings';
import { Entry, EntryItem, MicromatchOptions, ReaderOptions } from '../types/index';
import * as utils from '../utils/index';
import DeepFilter from './filters/deep';
import EntryFilter from './filters/entry';

export default abstract class Provider<T> {
	public readonly entryFilter: EntryFilter;
	public readonly deepFilter: DeepFilter;

	private readonly _micromatchOptions: MicromatchOptions;

	constructor(public readonly settings: Settings) {
		this._micromatchOptions = this.getMicromatchOptions();

		this.entryFilter = new EntryFilter(settings, this._micromatchOptions);
		this.deepFilter = new DeepFilter(settings, this._micromatchOptions);
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
	public getReaderOptions(task: Task): ReaderOptions {
		return {
			basePath: task.base === '.' ? '' : task.base,
			filter: this.entryFilter.getFilter(task.positive, task.negative),
			deep: this.deepFilter.getFilter(task.positive, task.negative)
		};
	}

	/**
	 * Returns options for micromatch.
	 */
	public getMicromatchOptions(): MicromatchOptions {
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
		if (this.settings.absolute) {
			entry.path = utils.path.makeAbsolute(this.settings.cwd, entry.path);
		}

		if (this.settings.markDirectories && entry.isDirectory()) {
			entry.path += path.sep;
		}

		entry.path = utils.path.unixify(entry.path);

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
