import * as os from 'os';
import * as path from 'path';

import { Pattern } from '../types';

const IS_WINDOWS_PLATFORM = os.platform() === 'win32';
const LEADING_DOT_SEGMENT_CHARACTERS_COUNT = 2; // ./ or .\\
/*
 * All non-escaped special characters.
 * Posix: ()*?[\]{|}, !+@ before (, ! at the beginning, \\ before non-special characters.
 * Windows: (){}, !+@ before (, ! at the beginning.
 */
const POSIX_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()*?[\]{|}]|^!|[!+@](?=\()|\\(?![!()*+?@[\]{|}]))/g;
const WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([(){}]|^!|[!+@](?=\())/g;

/**
 * Designed to work only with simple paths: `dir\\file`.
 */
export function unixify(filepath: string): string {
	return filepath.replace(/\\/g, '/');
}

export function makeAbsolute(cwd: string, filepath: string): string {
	return path.resolve(cwd, filepath);
}

export function removeLeadingDotSegment(entry: string): string {
	// We do not use `startsWith` because this is 10x slower than current implementation for some cases.
	// eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
	if (entry.charAt(0) === '.') {
		const secondCharactery = entry.charAt(1);

		if (secondCharactery === '/' || secondCharactery === '\\') {
			return entry.slice(LEADING_DOT_SEGMENT_CHARACTERS_COUNT);
		}
	}

	return entry;
}

export const escape = IS_WINDOWS_PLATFORM ? escapeWindowsPath : escapePosixPath;

export function escapeWindowsPath(pattern: Pattern): Pattern {
	return pattern.replace(WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE, '\\$2');
}

export function escapePosixPath(pattern: Pattern): Pattern {
	return pattern.replace(POSIX_UNESCAPED_GLOB_SYMBOLS_RE, '\\$2');
}
