import * as fs from 'fs';

// Must be synchronized with readdir-enhanced
export interface IEntry extends fs.Stats {
	path: string;
	depth: number;
}

export type EntryItem = string | IEntry;
export type Entry = IEntry;
