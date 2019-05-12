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

export type ReaderOptions = readdir.Options;
export type EntryFilterFunction = readdir.FilterFunction;
export type MicromatchOptions = micromatch.Options;
