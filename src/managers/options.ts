import { TEntryItem } from '../types/entries';
import { TPattern } from '../types/patterns';

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
	onlyDirs: boolean;
	/**
	 * Allows you to transform a path or `fs.Stats` object before sending to the array.
	 */
	transform: (<T>(entry: TEntryItem) => T) | null;
}

export type IPartialOptions = Partial<IOptions>;

export function prepare(options?: IPartialOptions): IOptions {
	return Object.assign({
		cwd: process.cwd(),
		deep: true,
		ignore: [],
		stats: false,
		onlyFiles: false,
		onlyDirs: false,
		transform: null
	}, options);
}
