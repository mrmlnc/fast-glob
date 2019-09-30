import * as path from 'path';

import { Pattern } from '../types';

const UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([*?|(){}[\]]|^!|[@+!](?=\())/g;

/**
 * Designed to work only with simple paths: `dir\\file`.
 */
export function unixify(filepath: string): string {
	return filepath.replace(/\\/g, '/');
}

export function makeAbsolute(cwd: string, filepath: string): string {
	return path.resolve(cwd, filepath);
}

export function escape(pattern: Pattern): Pattern {
	return pattern.replace(UNESCAPED_GLOB_SYMBOLS_RE, '\\$2');
}
