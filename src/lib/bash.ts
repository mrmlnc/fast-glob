'use strict';

import * as fs from 'fs';

import * as readdir from 'readdir-enhanced';
import * as bglob from 'bash-glob';
import * as micromatch from 'micromatch';

import { ITask } from './task';
import { IOptions } from '../fglob';

function fileStat(filepath: string): Promise<readdir.IEntry> {
	return new Promise((resolve, reject) => {
		fs.stat(filepath, (err, stat) => {
			if (err) {
				return reject(err);
			}
			resolve(stat);
		});
	});
}

export function async(task: ITask, options: IOptions): Promise<string[] | readdir.IEntry[]> {
	const pattern = task.base === '.' ? '**/*' : task.base + '/**/*';
	const cb = options.transform ? options.transform : (entry) => entry;
	let entries: string[] = [];

	return new Promise((resolve, reject) => {
		bglob(pattern, { cwd: options.cwd, dotglob: true, extglob: true }, (err, files) => {
			if (err) {
				return reject(err);
			}

			entries = micromatch(files, task.patterns);
			if (options.stats || options.onlyFiles || options.onlyDirs) {
				return Promise.all(entries.map(fileStat)).then((stats: any) => {
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

			resolve(entries.map(cb));
		});
	});
}

export function sync(task: ITask, options: IOptions): (string | readdir.IEntry)[] {
	const pattern = task.base === '.' ? '**/*' : task.base + '/**/*';
	const cb = options.transform ? options.transform : (entry) => entry;

	const files = bglob.sync(pattern, { dotglob: true, extglob: true });
	const entries = micromatch(files, task.patterns);

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
		return results.map(cb);
	}
	return entries.map(cb);
}
