import * as fs from 'fs';

import { FileSystemAdapter, Pattern } from './types/index';

export const DEFAULT_FILE_SYSTEM_ADAPTER: FileSystemAdapter = {
	lstat: fs.lstat,
	lstatSync: fs.lstatSync,
	stat: fs.stat,
	statSync: fs.statSync,
	readdir: fs.readdir,
	readdirSync: fs.readdirSync
};

export interface Options {
	/**
	 * The maximum number of concurrent calls to `fs.readdir`.
	 */
	concurrency?: number;
	/**
	 * The current working directory in which to search.
	 */
	cwd?: string;
	/**
	 * The deep option can be set to true to traverse the entire directory structure,
	 * or it can be set to a number to only traverse that many levels deep.
	 */
	deep?: number;
	/**
	 * Add an array of glob patterns to exclude matches.
	 */
	ignore?: Pattern[];
	/**
	 * Allow patterns to match filenames starting with a period (files & directories),
	 * even if the pattern does not explicitly have a period in that spot.
	 */
	dot?: boolean;
	/**
	 * Return `Entry` object instead of filepath.
	 */
	objectMode?: boolean;
	/**
	 * Return `fs.Stats` with `path` property instead of file path.
	 */
	stats?: boolean;
	/**
	 * Return only files.
	 */
	onlyFiles?: boolean;
	/**
	 * Return only directories.
	 */
	onlyDirectories?: boolean;
	/**
	 * Indicates whether to traverse descendants of symbolic link directories.
	 * Also, if the `stats` option is specified, it tries to get `fs.Stats` for symbolic link file.
	 */
	followSymbolicLinks?: boolean;
	/**
	 * Throw an error when symbolic link is broken if `true` or safely return `lstat` call if `false`.
	 */
	throwErrorOnBrokenSymbolicLink?: boolean;
	/**
	 * Prevent duplicate results.
	 */
	unique?: boolean;
	/**
	 * Add a `/` character to directory entries.
	 */
	markDirectories?: boolean;
	/**
	 * Return absolute paths for matched entries.
	 */
	absolute?: boolean;
	/**
	 * Enable expansion of brace patterns.
	 */
	braceExpansion?: boolean;
	/**
	 * Enable matching with globstars (`**`).
	 */
	globstar?: boolean;
	/**
	 * Enable extglob support, so that extglobs are regarded as literal characters.
	 */
	extglob?: boolean;
	/**
	 * Enable a case-sensitive regex for matching files.
	 */
	caseSensitiveMatch?: boolean;
	/**
	 * Allow glob patterns without slashes to match a file path based on its basename.
	 * For example, `a?b` would match the path `/xyz/123/acb`, but not `/xyz/acb/123`.
	 */
	baseNameMatch?: boolean;
	/**
	 * Suppress any errors from reader.
	 * Can be useful when the directory has entries with a special level of access.
	 */
	suppressErrors?: boolean;
	/**
	 * Custom implementation of methods for working with the file system.
	 */
	fs?: Partial<FileSystemAdapter>;
}

export default class Settings {
	public readonly absolute: boolean = this._getValue(this._options.absolute, false);
	public readonly baseNameMatch: boolean = this._getValue(this._options.baseNameMatch, false);
	public readonly braceExpansion: boolean = this._getValue(this._options.braceExpansion, true);
	public readonly caseSensitiveMatch: boolean = this._getValue(this._options.caseSensitiveMatch, true);
	public readonly concurrency: number = this._getValue(this._options.concurrency, Infinity);
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

	constructor(private readonly _options: Options = {}) {
		if (this.onlyDirectories) {
			this.onlyFiles = false;
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
