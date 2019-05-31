import * as path from 'path';

/**
 * Convert a windows-like path to a unix-style path.
 */
export function unixify(filepath: string): string {
	return filepath.replace(/\\/g, '/');
}

/**
 * Returns absolute path for provided filepath relative to cwd.
 */
export function makeAbsolute(cwd: string, filepath: string): string {
	return path.resolve(cwd, filepath);
}
