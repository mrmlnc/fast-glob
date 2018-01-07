import { TEntryItem } from '../types/entries';
import { TPattern } from '../types/patterns';

export type TTransformFunction<T> = (entry: TEntryItem) => T;

export interface IOptions {
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
	ignore: TPattern[];
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
	 * Allows you to transform a path or `fs.Stats` object before sending to the array.
	 */
	transform: TTransformFunction<TEntryItem> | null;
}

export type IPartialOptions = Partial<IOptions>;

export function prepare(options?: IPartialOptions): IOptions {
	return Object.assign<IOptions, IPartialOptions | undefined>({
		cwd: process.cwd(),
		deep: true,
		ignore: [],
		dot: false,
		stats: false,
		onlyFiles: true,
		onlyDirectories: false,
		transform: null
	}, options);
}
