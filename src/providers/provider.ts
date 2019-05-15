import * as path from 'path';

import { Task } from '../managers/tasks';
import Settings from '../settings';
import { MicromatchOptions, ReaderOptions } from '../types/index';
import DeepFilter from './filters/deep';
import EntryFilter from './filters/entry';
import EntryTransformer from './transformers/entry';

export default abstract class Provider<T> {
	public readonly entryFilter: EntryFilter;
	public readonly deepFilter: DeepFilter;
	public readonly entryTransformer: EntryTransformer;

	private readonly _micromatchOptions: MicromatchOptions;

	constructor(public readonly settings: Settings) {
		this._micromatchOptions = this.getMicromatchOptions();

		this.entryFilter = new EntryFilter(settings, this._micromatchOptions);
		this.deepFilter = new DeepFilter(settings, this._micromatchOptions);
		this.entryTransformer = new EntryTransformer(settings);
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
			deep: this.deepFilter.getFilter(task.positive, task.negative),
			transform: this.entryTransformer.getTransformer()
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
	 * Returns true if error has ENOENT code.
	 */
	public isEnoentCodeError(err: NodeJS.ErrnoException): boolean {
		return err.code === 'ENOENT';
	}
}
