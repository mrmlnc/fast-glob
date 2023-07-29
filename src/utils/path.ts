import * as os from 'os';
import * as path from 'path';

import type { Pattern } from '../types';

const IS_WINDOWS_PLATFORM = os.platform() === 'win32';
const LEADING_DOT_SEGMENT_CHARACTERS_COUNT = 2; // ./ or .\\
/**
 * All non-escaped special characters.
 * Posix: ()*?[\]{|}, !+@ before (, ! at the beginning, \\ before non-special characters.
 * Windows: (){}, !+@ before (, ! at the beginning.
 */
const POSIX_UNESCAPED_GLOB_SYMBOLS_RE = /(?<escape>\\?)(?<symbols>[()*?[\]{|}]|^!|[!+@](?=\()|\\(?![!()*+?@[\]{|}]))/g;
const WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE = /(?<escape>\\?)(?<symbols>[(){}]|^!|[!+@](?=\())/g;
/**
 * The device path (\\.\ or \\?\).
 * https://learn.microsoft.com/en-us/dotnet/standard/io/file-path-formats#dos-device-paths
 */
const DOS_DEVICE_PATH_RE = /^\\\\(?<path>[.?])/;
/**
 * All backslashes except those escaping special characters.
 * Windows: !()+@{}
 * https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file#naming-conventions
 */
const WINDOWS_BACKSLASHES_RE = /\\(?![!()+@{}])/g;

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

export const convertPathToPattern = IS_WINDOWS_PLATFORM ? convertWindowsPathToPattern : convertPosixPathToPattern;

export function convertWindowsPathToPattern(filepath: string): Pattern {
	return escapeWindowsPath(filepath)
		.replace(DOS_DEVICE_PATH_RE, '//$1')
		.replace(WINDOWS_BACKSLASHES_RE, '/');
}

export function convertPosixPathToPattern(filepath: string): Pattern {
	return escapePosixPath(filepath);
}
