import { Task } from '../managers/tasks';
import { Entry, EntryItem, ReaderOptions } from '../types';
import ReaderAsync from '../readers/async';
import Provider from './provider';

export default class ProviderAsync extends Provider<Promise<EntryItem[]>> {
	protected _reader: ReaderAsync = new ReaderAsync(this._settings);

	public async read(task: Task): Promise<EntryItem[]> {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		return ([] as Entry[])
			.concat(await this._readBasePatternDirectory(task, options))
			.concat(await this._readTask(root, task, options))
			.map((entry) => options.transform(entry));
	}

	private async _readBasePatternDirectory(task: Task, options: ReaderOptions): Promise<Entry[]> {
		/**
		 * Currently, the micromatch package cannot match the input string `.` when the '**' pattern is used.
		 */
		if (task.base === '.') {
			return [];
		}

		if (task.dynamic && this._settings.includePatternBaseDirectory) {
			return this._reader.static([task.base], options);
		}

		return [];
	}

	private _readTask(root: string, task: Task, options: ReaderOptions): Promise<Entry[]> {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
