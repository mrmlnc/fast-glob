import { EntryItem } from '../types/entries';
import { Pattern } from '../types/patterns';

export type TransformFunction<T> = (entry: EntryItem) => T;

export interface IOptions<T = EntryItem> {
	/**
	 * The current working directory in which to search.
	 */
	cwd: string;
	/**
	 * The deep option can be set to true to traverse the entire directory structure,
	 * or it can be set to a number to only traverse that many levels deep.
	 */
	deep: number | boolean;
	/**
	 * Add an array of glob patterns to exclude matches.
	 */
	ignore: Pattern[];
	/**
	 * Allow patterns to match filenames starting with a period (files & directories),
	 * even if the pattern does not explicitly have a period in that spot.
	 */
	dot: boolean;
	/**
	 * Return `fs.Stats` with `path` property instead of file path.
	 */
	stats: boolean;
	/**
	 * Return only files.
	 */
	onlyFiles: boolean;
	/**
	 * Return only directories.
	 */
	onlyDirectories: boolean;
	/**
	 * Follow symlinked directories when expanding `**` patterns.
	 */
	followSymlinkedDirectories: boolean;
	/**
	 * Prevent duplicate results.
	 */
	unique: boolean;
	/**
	 * Add a `/` character to directory entries.
	 */
	markDirectories: boolean;
	/**
	 * Disable expansion of brace patterns.
	 */
	nobrace: boolean;
	/**
	 * Disable matching with globstars (`**`).
	 */
	noglobstar: boolean;
	/**
	 * Disable extglob support, so that extglobs are regarded as literal characters.
	 */
	noext: boolean;
	/**
	 * Use a case-insensitive regex for matching files.
	 */
	nocase: boolean;
	/**
	 * Allow glob patterns without slashes to match a file path based on its basename.
	 * For example, `a?b` would match the path `/xyz/123/acb`, but not `/xyz/acb/123`.
	 */
	matchBase: boolean;
	/**
	 * Allows you to transform a path or `fs.Stats` object before sending to the array.
	 */
	transform: TransformFunction<T> | null;
}

export type IPartialOptions<T = EntryItem> = Partial<IOptions<T>>;

export function prepare(options?: IPartialOptions): IOptions {
	return Object.assign<IOptions, IPartialOptions | undefined>({
		cwd: process.cwd(),
		deep: true,
		ignore: [],
		dot: false,
		stats: false,
		onlyFiles: true,
		onlyDirectories: false,
		followSymlinkedDirectories: true,
		unique: true,
		markDirectories: false,
		nobrace: false,
		noglobstar: false,
		noext: false,
		nocase: false,
		matchBase: false,
		transform: null
	}, options);
}
