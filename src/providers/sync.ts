import { Task } from '../managers/tasks';
import ReaderSync from '../readers/sync';
import { Entry, EntryItem, ReaderOptions } from '../types';
import Provider from './provider';

export default class ProviderSync extends Provider<EntryItem[]> {
	protected _reader: ReaderSync = new ReaderSync(this._settings);

	public read(task: Task): EntryItem[] {
		const root = this._getRootDirectory(task);
		const options = this._getReaderOptions(task);

		return ([] as Entry[])
			.concat(this._readBasePatternDirectory(task, options))
			.concat(this._readTask(root, task, options))
			.map(options.transform);
	}

	private _readBasePatternDirectory(task: Task, options: ReaderOptions): Entry[] {
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

	private _readTask(root: string, task: Task, options: ReaderOptions): Entry[] {
		if (task.dynamic) {
			return this._reader.dynamic(root, options);
		}

		return this._reader.static(task.patterns, options);
	}
}
