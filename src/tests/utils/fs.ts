import * as fs from 'fs';

export function isDirectory(filepath: string): boolean {
	const stats = fs.lstatSync(filepath);

	return stats.isDirectory();
}
