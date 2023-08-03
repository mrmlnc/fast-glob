import * as fs from 'node:fs';

export function isDirectory(filepath: string): boolean {
	const stats = fs.lstatSync(filepath);

	return stats.isDirectory();
}
