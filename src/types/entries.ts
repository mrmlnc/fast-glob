import * as fs from 'fs';

// Must be synchronized with readdir-enhanced
export interface IEntry extends fs.Stats {
	path: string;
	depth: number;
}

export type TEntryItem = string | IEntry;
export type TEntry = IEntry;
