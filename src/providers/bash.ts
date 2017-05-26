'use strict';

import * as fs from 'fs';

import * as readdir from 'readdir-enhanced';
import * as bglob from 'bash-glob';
import * as micromatch from 'micromatch';

import { IOptions } from '../fglob';
import { ITask } from '../utils/task';
import { statFile } from '../utils/io';
import { isNegative, getNegativeAsPositive } from '../utils/patterns';

function filterByNegativePatterns(files: string[], patterns: string[]) {
	const negativePatterns = getNegativeAsPositive(patterns);
	const entries = [];
	for (let i = 0; i < files.length; i++) {
		if (micromatch(files[i], negativePatterns).length === 0) {
			entries.push(files[i]);
		}
	}
	return entries;
}

export function async(task: ITask, options: IOptions): Promise<string[] | readdir.IEntry[]> {
	const patterns = task.patterns.filter((pattern) => !isNegative(pattern));
	const cb = options.transform ? options.transform : (entry) => entry;

	return new Promise((resolve, reject) => {
		bglob(patterns, { cwd: options.cwd, dotglob: true }, (err, files) => {
			if (err) {
				return reject(err);
			}

			const entries = filterByNegativePatterns(files, task.patterns);
			if (options.stats || options.onlyFiles || options.onlyDirs) {
				return Promise.all(entries.map(statFile)).then((stats: readdir.IEntry[]) => {
					const results: (string | readdir.IEntry)[] = [];

					for (let i = 0; i < stats.length; i++) {
						const entry = stats[i];
						if ((options.onlyFiles && !entry.isFile()) || (options.onlyDirs && !entry.isDirectory())) {
							continue;
						}
						entry.path = entries[i];
						results.push(cb(options.stats ? entry : entry.path));
					}
					resolve(results);
				});
			}
			resolve(options.transform ? (<any>entries).map(cb) : entries);
		});
	});
}

export function sync(task: ITask, options: IOptions): (string | readdir.IEntry)[] {
	const patterns = task.patterns.filter((pattern) => !isNegative(pattern));
	const cb = options.transform ? options.transform : (entry) => entry;

	const files = bglob.sync(patterns, { cwd: options.cwd, dotglob: true });
	const entries = filterByNegativePatterns(files, task.patterns);

	if (options.stats || options.onlyFiles || options.onlyDirs) {
		const results: (string | readdir.IEntry)[] = [];

		for (let i = 0; i < entries.length; i++) {
			const entry = <readdir.IEntry>fs.statSync(entries[i]);
			if ((options.onlyFiles && !entry.isFile()) || (options.onlyDirs && !entry.isDirectory())) {
				continue;
			}
			entry.path = entries[i];
			results.push(cb(options.stats ? entry : entry.path));
		}
		return results;
	}
	return options.transform ? entries.map(cb) : entries;
}
