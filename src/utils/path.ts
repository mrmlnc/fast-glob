import * as path from 'path';

/**
 * Returns «true» if the last partial of the path starting with a period.
 */
export function isDotDirectory(filepath: string): boolean {
	return path.basename(filepath).startsWith('.');
}

/**
 * Convert a windows-like path to a unix-style path.
 */
export function normalize(filepath: string): string {
	return filepath.replace(/\\/g, '/');
}
