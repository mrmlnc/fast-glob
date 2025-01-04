import * as fs from 'node:fs';

import type { FileSystemAdapter, Pattern } from './types';

export const DEFAULT_FILE_SYSTEM_ADAPTER: FileSystemAdapter = {
	lstat: fs.lstat,
	lstatSync: fs.lstatSync,
	stat: fs.stat,
	statSync: fs.statSync,
	readdir: fs.readdir,
	readdirSync: fs.readdirSync,
};

export interface Options {
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
	ignore?: readonly Pattern[];
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
	 * A signal to abort searching for entries on the file system.
	 * Works only with asynchronous methods for dynamic and static patterns.
	 *
	 * @default undefined
	 */
	signal?: AbortSignal;
}

export default class Settings {
	public readonly absolute: boolean;
	public readonly baseNameMatch: boolean;
	public readonly braceExpansion: boolean;
	public readonly caseSensitiveMatch: boolean;
	public readonly cwd: string;
	public readonly deep: number;
	public readonly dot: boolean;
	public readonly extglob: boolean;
	public readonly followSymbolicLinks: boolean;
	public readonly fs: FileSystemAdapter;
	public readonly globstar: boolean;
	public readonly ignore: readonly Pattern[];
	public readonly markDirectories: boolean;
	public readonly objectMode: boolean;
	public readonly onlyDirectories: boolean;
	public readonly onlyFiles: boolean;
	public readonly stats: boolean;
	public readonly suppressErrors: boolean;
	public readonly throwErrorOnBrokenSymbolicLink: boolean;
	public readonly unique: boolean;
	public readonly signal?: AbortSignal;

	// eslint-disable-next-line complexity
	constructor(options: Options = {}) {
		this.absolute = options.absolute ?? false;
		this.baseNameMatch = options.baseNameMatch ?? false;
		this.braceExpansion = options.braceExpansion ?? true;
		this.caseSensitiveMatch = options.caseSensitiveMatch ?? true;
		this.cwd = options.cwd ?? process.cwd();
		this.deep = options.deep ?? Number.POSITIVE_INFINITY;
		this.dot = options.dot ?? false;
		this.extglob = options.extglob ?? true;
		this.followSymbolicLinks = options.followSymbolicLinks ?? true;
		this.fs = this.#getFileSystemMethods(options.fs);
		this.globstar = options.globstar ?? true;
		this.ignore = options.ignore ?? [];
		this.markDirectories = options.markDirectories ?? false;
		this.objectMode = options.objectMode ?? false;
		this.onlyDirectories = options.onlyDirectories ?? false;
		this.onlyFiles = options.onlyFiles ?? true;
		this.stats = options.stats ?? false;
		this.suppressErrors = options.suppressErrors ?? false;
		this.throwErrorOnBrokenSymbolicLink = options.throwErrorOnBrokenSymbolicLink ?? false;
		this.unique = options.unique ?? true;
		this.signal = options.signal;

		if (this.onlyDirectories) {
			this.onlyFiles = false;
		}

		if (this.stats) {
			this.objectMode = true;
		}
	}

	#getFileSystemMethods(methods: Partial<FileSystemAdapter> = {}): FileSystemAdapter {
		return {
			...DEFAULT_FILE_SYSTEM_ADAPTER,
			...methods,
		};
	}
}
