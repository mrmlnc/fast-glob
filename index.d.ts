/// <reference path="./typings/readdir-enhanced.d.ts" />

import { IPartialOptions } from './out/managers/options';
import { TEntryItem } from './out/types/entries';
import { TPattern } from './out/types/patterns';

declare namespace FastGlob {
	export interface IApi {
		(patterns: TPattern | TPattern[], options?: IPartialOptions): Promise<TEntryItem[]>;

		async(patterns: TPattern | TPattern[], options?: IPartialOptions): Promise<TEntryItem[]>;
		sync(patterns:TPattern |  TPattern[], options?: IPartialOptions): TEntryItem[];
		stream(patterns: TPattern | TPattern[], options?: IPartialOptions): NodeJS.ReadableStream;
	}
}

declare const api: FastGlob.IApi;

export = api;
