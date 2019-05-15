import * as fs from 'fs';

import * as readdir from '@mrmlnc/readdir-enhanced';
import * as micromatch from 'micromatch';

// Must be synchronized with readdir-enhanced
export interface Entry extends fs.Stats {
	path: string;
	depth: number;
}

export type EntryItem = string | Entry;

export type Pattern = string;
export type PatternRe = RegExp;
export type PatternsGroup = Record<string, Pattern[]>;

export interface ReaderOptions extends readdir.Options {
	transform(entry: Entry): EntryItem;
}

export type EntryFilterFunction = readdir.FilterFunction;
export type EntryTransformerFunction = (entry: Entry) => EntryItem;
export type MicromatchOptions = micromatch.Options;
