import * as path from 'path';

import * as readdir from 'readdir-enhanced';
import * as micromatch from 'micromatch';

import { ITask } from '../utils/task';
import { IOptions } from '../fglob';
import { TEntryItem } from '../types/entries';

function isEnoentCodeError(err: any): boolean {
	return err.code === 'ENOENT';
}

function filter(entry: readdir.IEntry, patterns: string[], options: IOptions): boolean {
	if ((options.onlyFiles && !entry.isFile()) || (options.onlyDirs && !entry.isDirectory())) {
		return false;
	}
	if (micromatch([entry.path], patterns).length !== 0) {
		return true;
	}
	return false;
}

export function async(task: ITask, options: IOptions): Promise<TEntryItem[]> {
	const cwd = path.resolve(options.cwd, task.base);
	const entries: TEntryItem[] = [];

	const api = options.stats ? readdir.readdirStreamStat : readdir.stream;

	return new Promise((resolve, reject) => {
		const stream = api(cwd, {
			filter: (entry) => filter(entry, task.patterns, options),
			basePath: task.base === '.' ? '' : task.base,
			deep: options.deep,
			sep: '/'
		});

		stream.on('data', (entry) => entries.push(options.transform ? options.transform(entry) : entry));
		stream.on('error', (err) => isEnoentCodeError(err) ? resolve([]) : reject(err));
		stream.on('end', () => resolve(entries));
	});
}

export function sync(task: ITask, options: IOptions): TEntryItem[] {
	const cwd = path.resolve(options.cwd, task.base);

	try {
		const api = options.stats ? readdir.readdirSyncStat : readdir.sync;

		const entries = api(cwd, {
			filter: (entry) => filter(entry, task.patterns, options),
			basePath: task.base === '.' ? '' : task.base,
			deep: options.deep,
			sep: '/'
		});

		return options.transform ? (entries as TEntryItem[]).map(options.transform) : entries;
	} catch (err) {
		if (isEnoentCodeError(err)) {
			return [];
		}

		throw err;
	}
}
