declare module "readdir-enhanced" {

	import fs = require('fs');

	namespace readdir {
		interface IFilterFunction {
			(stat: IEntry): boolean;
		}

		interface IOptions {
			filter?: string | RegExp | IFilterFunction;
			deep?: boolean | number;
			sep?: string;
			basePath?: string;
		}

		interface IEntry extends fs.Stats {
			path: string;
		}

		// Sync
		function sync(root: string, options?: IOptions): string[];
		function readdirSyncStat(root: string, options?: IOptions): IEntry[];

		// Promise
		function async(root: string, options?: IOptions): Promise<string[]>;
		function readdirAsyncStat(root: string, options?: IOptions): Promise<IEntry[]>;

		// Callback
		function async(root: string, cb: (err, files: string[]) => void): void;
		function async(root: string, options: IOptions, cb: (err, files: string[]) => void): void;

		// Stream
		function stream(root: string, options?: IOptions): NodeJS.ReadableStream;
		function readdirStreamStat(root: string, options?: IOptions): NodeJS.ReadableStream;
	}

	export = readdir;
}
