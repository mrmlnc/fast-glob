import * as fs from 'fs';
import * as os from 'os';

import { FileSystemAdapter, Pattern } from './types';

/**
 * The `os.cpus` method can return zero. We expect the number of cores to be greater than zero.
 * https://github.com/nodejs/node/blob/7faeddf23a98c53896f8b574a6e66589e8fb1eb8/lib/os.js#L106-L107
 */
const CPU_COUNT = Math.max(os.cpus().length, 1);

export const DEFAULT_FILE_SYSTEM_ADAPTER: FileSystemAdapter = {
	lstat: fs.lstat,
	lstatSync: fs.lstatSync,
	stat: fs.stat,
	statSync: fs.statSync,
	readdir: fs.readdir,
	readdirSync: fs.readdirSync
};

export type Options = {
	/**
	 * Return the absolute path for entries.
	 *
	 * @default false
	 */
	absolute?: boolean;
	/**
	 * If set to `true`, then patterns without slashes will be matched against
	 * the basename of the path if it contains slashes.
	 *
	 * @default false
	 */
	baseNameMatch?: boolean;
	/**
	 * Enables Bash-like brace expansion.
	 *
	 * @default true
	 */
	braceExpansion?: boolean;
	/**
	 * Enables a case-sensitive mode for matching files.
	 *
	 * @default true
	 */
	caseSensitiveMatch?: boolean;
	/**
	 * Specifies the maximum number of concurrent requests from a reader to read
	 * directories.
	 *
	 * @default os.cpus().length
	 */
	concurrency?: number;
	/**
	 * The current working directory in which to search.
	 *
	 * @default process.cwd()
	 */
	cwd?: string;
	/**
	 * Specifies the maximum depth of a read directory relative to the start
	 * directory.
	 *
	 * @default Infinity
	 */
	deep?: number;
	/**
	 * Allow patterns to match entries that begin with a period (`.`).
	 *
	 * @default false
	 */
	dot?: boolean;
	/**
	 * Enables Bash-like `extglob` functionality.
	 *
	 * @default true
	 */
	extglob?: boolean;
	/**
	 * Indicates whether to traverse descendants of symbolic link directories.
	 *
	 * @default true
	 */
	followSymbolicLinks?: boolean;
	/**
	 * Custom implementation of methods for working with the file system.
	 *
	 * @default fs.*
	 */
	fs?: Partial<FileSystemAdapter>;
	/**
	 * Enables recursively repeats a pattern containing `**`.
	 * If `false`, `**` behaves exactly like `*`.
	 *
	 * @default true
	 */
	globstar?: boolean;
	/**
	 * An array of glob patterns to exclude matches.
	 * This is an alternative way to use negative patterns.
	 *
	 * @default []
	 */
	ignore?: Pattern[];
	/**
	 * Mark the directory path with the final slash.
	 *
	 * @default false
	 */
	markDirectories?: boolean;
	/**
	 * Returns objects (instead of strings) describing entries.
	 *
	 * @default false
	 */
	objectMode?: boolean;
	/**
	 * Return only directories.
	 *
	 * @default false
	 */
	onlyDirectories?: boolean;
	/**
	 * Return only files.
	 *
	 * @default true
	 */
	onlyFiles?: boolean;
	/**
	 * Enables an object mode (`objectMode`) with an additional `stats` field.
	 *
	 * @default false
	 */
	stats?: boolean;
	/**
	 * By default this package suppress only `ENOENT` errors.
	 * Set to `true` to suppress any error.
	 *
	 * @default false
	 */
	suppressErrors?: boolean;
	/**
	 * Throw an error when symbolic link is broken if `true` or safely
	 * return `lstat` call if `false`.
	 *
	 * @default false
	 */
	throwErrorOnBrokenSymbolicLink?: boolean;
	/**
	 * Ensures that the returned entries are unique.
	 *
	 * @default true
	 */
	unique?: boolean;
	/**
	 * Include the base directory of the pattern in the results.
	 *
	 * @default false
	 */
	includePatternBaseDirectory?: boolean;
};

export default class Settings {
	public readonly absolute: boolean = this._getValue(this._options.absolute, false);
	public readonly baseNameMatch: boolean = this._getValue(this._options.baseNameMatch, false);
	public readonly braceExpansion: boolean = this._getValue(this._options.braceExpansion, true);
	public readonly caseSensitiveMatch: boolean = this._getValue(this._options.caseSensitiveMatch, true);
	public readonly concurrency: number = this._getValue(this._options.concurrency, CPU_COUNT);
	public readonly cwd: string = this._getValue(this._options.cwd, process.cwd());
	public readonly deep: number = this._getValue(this._options.deep, Infinity);
	public readonly dot: boolean = this._getValue(this._options.dot, false);
	public readonly extglob: boolean = this._getValue(this._options.extglob, true);
	public readonly followSymbolicLinks: boolean = this._getValue(this._options.followSymbolicLinks, true);
	public readonly fs: FileSystemAdapter = this._getFileSystemMethods(this._options.fs);
	public readonly globstar: boolean = this._getValue(this._options.globstar, true);
	public readonly ignore: Pattern[] = this._getValue(this._options.ignore, [] as Pattern[]);
	public readonly markDirectories: boolean = this._getValue(this._options.markDirectories, false);
	public readonly objectMode: boolean = this._getValue(this._options.objectMode, false);
	public readonly onlyDirectories: boolean = this._getValue(this._options.onlyDirectories, false);
	public readonly onlyFiles: boolean = this._getValue(this._options.onlyFiles, true);
	public readonly stats: boolean = this._getValue(this._options.stats, false);
	public readonly suppressErrors: boolean = this._getValue(this._options.suppressErrors, false);
	public readonly throwErrorOnBrokenSymbolicLink: boolean = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, false);
	public readonly unique: boolean = this._getValue(this._options.unique, true);
	public readonly includePatternBaseDirectory: boolean = this._getValue(this._options.includePatternBaseDirectory, false);

	constructor(private readonly _options: Options = {}) {
		if (this.onlyDirectories) {
			this.onlyFiles = false;
		}

		if (this.onlyFiles) {
			this.includePatternBaseDirectory = false;
		}

		if (this.stats) {
			this.objectMode = true;
		}
	}

	private _getValue<T>(option: T | undefined, value: T): T {
		return option === undefined ? value : option;
	}

	private _getFileSystemMethods(methods: Partial<FileSystemAdapter> = {}): FileSystemAdapter {
		return {
			...DEFAULT_FILE_SYSTEM_ADAPTER,
			...methods
		};
	}
}
