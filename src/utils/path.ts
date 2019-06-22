import * as path from 'path';

/**
 * Designed to work only with simple paths: `dir\\file`.
 */
export function unixify(filepath: string): string {
	return filepath.replace(/\\/g, '/');
}

export function makeAbsolute(cwd: string, filepath: string): string {
	return path.resolve(cwd, filepath);
}
