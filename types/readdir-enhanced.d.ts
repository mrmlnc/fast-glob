declare module "readdir-enhanced" {

	import * as fs from 'fs';

	namespace readdir {
		interface IEntry extends fs.Stats {
			path: string;
		}

		type TFilterFunction = (stat: IEntry) => boolean;
		type TReaddirFilterOption = string | RegExp | TFilterFunction;
		type TReaddirDeepOption = boolean | number | RegExp | TFilterFunction;

		interface IReaddirOptions {
			filter?: TReaddirFilterOption;
			deep?: TReaddirDeepOption;
			sep?: string;
			basePath?: string;
		}

		// Sync
		function sync(root: string, options?: IReaddirOptions): string[];
		function readdirSyncStat(root: string, options?: IReaddirOptions): IEntry[];

		// Promise
		function async(root: string, options?: IReaddirOptions): Promise<string[]>;
		function readdirAsyncStat(root: string, options?: IReaddirOptions): Promise<IEntry[]>;

		// Callback
		function async(root: string, cb: (err: Error, files: string[]) => void): void;
		function async(root: string, options: IReaddirOptions, cb: (err: Error, files: string[]) => void): void;

		// Stream
		function stream(root: string, options?: IReaddirOptions): NodeJS.ReadableStream;
		function readdirStreamStat(root: string, options?: IReaddirOptions): NodeJS.ReadableStream;
	}

	export = readdir;
}
