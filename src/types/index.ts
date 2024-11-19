import type * as fs from 'node:fs';
import type * as fsWalk from '@nodelib/fs.walk';

export type Dictionary<T = unknown> = Record<string, T>;

export type ErrnoException = NodeJS.ErrnoException;

export type FsDirent = fs.Dirent;
export type FsStats = fs.Stats;
export type Entry = fsWalk.Entry;
export type EntryItem = Entry | string;

export type Pattern = string;
export type PatternRe = RegExp;
export type PatternsGroup = Dictionary<Pattern[]>;

export type ReaderOptions = {
	transform: (entry: Entry) => EntryItem;
	deepFilter: DeepFilterFunction;
	entryFilter: EntryFilterFunction;
	errorFilter: ErrorFilterFunction;
	fs: FileSystemAdapter;
	stats: boolean;
} & fsWalk.Options;

export type ErrorFilterFunction = fsWalk.ErrorFilterFunction;
export type EntryFilterFunction = fsWalk.EntryFilterFunction;
export type DeepFilterFunction = fsWalk.DeepFilterFunction;
export type EntryTransformerFunction = (entry: Entry) => EntryItem;

export interface MicromatchOptions {
	dot?: boolean;
	matchBase?: boolean;
	nobrace?: boolean;
	nocase?: boolean;
	noext?: boolean;
	noglobstar?: boolean;
	posix?: boolean;
	strictSlashes?: boolean;
}

export type FileSystemAdapter = fsWalk.FileSystemAdapter;
