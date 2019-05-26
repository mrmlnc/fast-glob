import { EntryItem, Pattern } from './types/index';

export type TransformFunction<T> = (entry: EntryItem) => T;

export interface Options<T = EntryItem> {
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
	deep?: number | boolean;
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
	matchBase?: boolean;
	/**
	 * Allows you to transform a path or `fs.Stats` object before sending to the array.
	 */
	transform?: TransformFunction<T> | null;
}

export default class Settings {
	public readonly cwd: string = this._getValue(this._options.cwd, process.cwd());
	public readonly concurrency: number = this._getValue(this._options.concurrency, Infinity);
	public readonly deep: number | boolean = this._getValue(this._options.deep, true);
	public readonly ignore: Pattern[] = this._getValue(this._options.ignore, [] as Pattern[]);
	public readonly dot: boolean = this._getValue(this._options.dot, false);
	public readonly stats: boolean = this._getValue(this._options.stats, false);
	public readonly onlyFiles: boolean = this._getValue(this._options.onlyFiles, true);
	public readonly onlyDirectories: boolean = this._getValue(this._options.onlyDirectories, false);
	public readonly followSymbolicLinks: boolean = this._getValue(this._options.followSymbolicLinks, true);
	public readonly throwErrorOnBrokenSymbolicLink: boolean = this.stats && this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
	public readonly unique: boolean = this._getValue(this._options.unique, true);
	public readonly markDirectories: boolean = this._getValue(this._options.markDirectories, false);
	public readonly absolute: boolean = this._getValue(this._options.absolute, false);
	public readonly braceExpansion: boolean = this._getValue(this._options.braceExpansion, true);
	public readonly globstar: boolean = this._getValue(this._options.globstar, true);
	public readonly extglob: boolean = this._getValue(this._options.extglob, true);
	public readonly caseSensitiveMatch: boolean = this._getValue(this._options.caseSensitiveMatch, true);
	public readonly matchBase: boolean = this._getValue(this._options.matchBase, false);
	public readonly transform: TransformFunction<EntryItem> | null = this._getValue(this._options.transform, null);

	constructor(private readonly _options: Options = {}) {
		if (this.onlyDirectories) {
			this.onlyFiles = false;
		}
	}

	private _getValue<T>(option: T | undefined, value: T): T {
		return option === undefined ? value : option;
	}
}
