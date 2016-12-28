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

function isNegative(pattern: string): boolean {
	return pattern[0] === '!';
}

function getNegativeAsPositivePatterns(patterns: string[]) {
	return patterns.filter((pattern) => isNegative(pattern)).map((pattern) => pattern.slice(1));
}

function filterByNegativePatterns(files: string[], patterns: string[]) {
	const negativePatterns = getNegativeAsPositivePatterns(patterns);
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
		bglob(patterns, { cwd: options.cwd, dotglob: true, extglob: true }, (err, files) => {
			if (err) {
				return reject(err);
			}

			const entries = filterByNegativePatterns(files, task.patterns);

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
	const patterns = task.patterns.filter((pattern) => !isNegative(pattern));
	const cb = options.transform ? options.transform : (entry) => entry;

	const files = bglob.sync(patterns, { dotglob: true, extglob: true });
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
		return results.map(cb);
	}
	return entries.map(cb);
}
