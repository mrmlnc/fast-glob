import { IOptions } from './out/fglob';
import { TEntryItem } from './out/types/entries';

declare namespace FastGlob {
	export interface IApi {
		(patterns: string[], options?: IOptions): Promise<TEntryItem[]>;

		sync(patterns: string[], options?: IOptions): TEntryItem[];
	}
}

declare const api: FastGlob.IApi;

export = api;
