import { TTransformFunction, IPartialOptions } from './out/managers/options';
import { TEntry, TEntryItem } from './out/types/entries';
import { TPattern } from './out/types/patterns';

declare namespace FastGlob {
	type Entry = TEntry;
	type EntryItem = TEntryItem;
	type TransformFunction<T> = TTransformFunction<T>;

	interface IApi {
		<T = EntryItem>(patterns: TPattern | TPattern[], options?: IPartialOptions<T>): Promise<T[]>;

		async<T = EntryItem>(patterns: TPattern | TPattern[], options?: IPartialOptions<T>): Promise<T[]>;
		sync<T = EntryItem>(patterns: TPattern | TPattern[], options?: IPartialOptions<T>): T[];
		stream(patterns: TPattern | TPattern[], options?: IPartialOptions): NodeJS.ReadableStream;
	}
}

declare const FastGlob: FastGlob.IApi;

export = FastGlob;
export as namespace FastGlob;
