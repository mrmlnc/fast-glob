import * as fsWalk from '@nodelib/fs.walk';

import * as micromatch from 'micromatch';

export type Entry = fsWalk.Entry;
export type EntryItem = string | Entry;

export type Pattern = string;
export type PatternRe = RegExp;
export type PatternsGroup = Record<string, Pattern[]>;

export interface ReaderOptions {
	basePath: string | null;
	entryFilter: EntryFilterFunction;
	deepFilter: DeepFilterFunction;
	transform(entry: Entry): EntryItem;
}

export type EntryFilterFunction = fsWalk.EntryFilterFunction;
export type DeepFilterFunction = fsWalk.DeepFilterFunction;
export type EntryTransformerFunction = (entry: Entry) => EntryItem;
export type MicromatchOptions = micromatch.Options;
