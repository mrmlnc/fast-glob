declare module "readdir-enhanced" {

	import * as fs from 'fs';

	namespace readdir {
		type TFilterFunction = (stat: IEntry) => boolean;
		type TReaddirFilterOption = string | RegExp | TFilterFunction;
		type TReaddirDeepOption = boolean | number | RegExp | TFilterFunction;

		type TCallback<T> = null | undefined | ((err: NodeJS.ErrnoException, result: T) => void)

		interface IEntry extends fs.Stats {
			path: string;
			depth: number;
		}

		interface IFileSystem {
			readdir?: (path: string, callback: TCallback<string[]>) => void;
			lstat?: (path: string, callback: TCallback<fs.Stats>) => void;
			stat?: (path: string, callback: TCallback<fs.Stats>) => void;
		}

		interface IReaddirOptions<T = any> {
			filter?: TReaddirFilterOption;
			deep?: TReaddirDeepOption;
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
		function async(root: string, callback: TCallback<string[]>): void;
		function async(root: string, options: IReaddirOptions, callback: TCallback<string[]>): void;

		// Stream
		function stream(root: string, options?: IReaddirOptions): NodeJS.ReadableStream;
		function readdirStreamStat(root: string, options?: IReaddirOptions): NodeJS.ReadableStream;
	}

	export = readdir;
}
