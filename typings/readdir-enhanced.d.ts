declare module "readdir-enhanced" {

	import * as fs from 'fs';

	namespace readdir {
		type FilterFunction = (stat: IEntry) => boolean;
		type ReaddirFilterOption = string | RegExp | FilterFunction;
		type ReaddirDeepOption = boolean | number | RegExp | FilterFunction;

		type Callback<T> = null | undefined | ((err: NodeJS.ErrnoException, result: T) => void)

		interface IEntry extends fs.Stats {
			path: string;
			depth: number;
		}

		interface IFileSystem {
			readdir?: (path: string, callback: Callback<string[]>) => void;
			lstat?: (path: string, callback: Callback<fs.Stats>) => void;
			stat?: (path: string, callback: Callback<fs.Stats>) => void;
		}

		interface IReaddirOptions<T = any> {
			filter?: ReaddirFilterOption;
			deep?: ReaddirDeepOption;
			sep?: string;
			basePath?: string;
			fs?: IFileSystem;
		}

		// Sync
		function readdirSyncStat(root: string, options?: IReaddirOptions): IEntry[];
		function sync(root: string, options?: IReaddirOptions): string[];
		namespace sync {
			function stat(root: string, options?: IReaddirOptions): string[];
		}

		// Promise
		function readdirAsyncStat(root: string, options?: IReaddirOptions): Promise<IEntry[]>;
		function async(root: string, options?: IReaddirOptions): Promise<string[]>;
		namespace async {
			function stat(root: string, options?: IReaddirOptions): Promise<IEntry[]>;
		}

		// Callback
		function async(root: string, callback: Callback<string[]>): void;
		function async(root: string, options: IReaddirOptions, callback: Callback<string[]>): void;

		// Stream
		function stream(root: string, options?: IReaddirOptions): NodeJS.ReadableStream;
		function readdirStreamStat(root: string, options?: IReaddirOptions): NodeJS.ReadableStream;
	}

	export = readdir;
}
