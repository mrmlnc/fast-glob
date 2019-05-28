import * as fsWalk from '@nodelib/fs.walk';

import * as micromatch from 'micromatch';

export type ErrnoException = NodeJS.ErrnoException;

export type Entry = fsWalk.Entry;
export type EntryItem = string | Entry;

export type Pattern = string;
export type PatternRe = RegExp;
export type PatternsGroup = Record<string, Pattern[]>;

export interface ReaderOptions extends fsWalk.Options {
	basePath: string | null;
	deepFilter: DeepFilterFunction;
	entryFilter: EntryFilterFunction;
	fs: FileSystemAdapter;
	stats: boolean;
	transform(entry: Entry): EntryItem;
}

export type ErrorFilterFunction = fsWalk.ErrorFilterFunction;
export type EntryFilterFunction = fsWalk.EntryFilterFunction;
export type DeepFilterFunction = fsWalk.DeepFilterFunction;
export type EntryTransformerFunction = (entry: Entry) => EntryItem;
export type MicromatchOptions = micromatch.Options;

export type FileSystemAdapter = fsWalk.FileSystemAdapter;
