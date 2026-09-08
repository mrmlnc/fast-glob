import * as path from 'node:path';
import globParent from 'glob-parent';
import micromatch from 'micromatch';
import type { MicromatchOptions, Pattern, PatternRe } from '../types/index.js';

const GLOBSTAR = '**';
const ESCAPE_SYMBOL = '\\';
const QUESTION_MARK_SYMBOL = '?';

const COMMON_GLOB_SYMBOLS_RE = /[*?]|^!/;
const REGEX_CHARACTER_CLASS_SYMBOLS_RE = /\[[^[]*\]/;
const REGEX_GROUP_SYMBOLS_RE = /(?:^|[^!*+?@])\([^(]*\|[^|]*\)/;
const GLOB_EXTENSION_SYMBOLS_RE = /[!*+?@]\([^(]*\)/;
const BRACE_EXPANSION_SEPARATORS_RE = /,|\.\./;

/**
 * Matches a sequence of two or more consecutive slashes, excluding the first two slashes at the beginning of the string.
 * The latter is due to the presence of the device path at the beginning of the UNC path.
 */
const DOUBLE_SLASH_RE = /(?!^)\/{2,}/g;

type PatternTypeOptions = {
	braceExpansion?: boolean;
	caseSensitiveMatch?: boolean;
	extglob?: boolean;
};

export function isStaticPattern(pattern: Pattern, options: PatternTypeOptions = {}): boolean {
	return !isDynamicPattern(pattern, options);
}

export function isDynamicPattern(pattern: Pattern, options: PatternTypeOptions = {}): boolean {
	/**
	 * A special case with an empty string is necessary for matching patterns that start with a forward slash.
	 * An empty string cannot be a dynamic pattern.
	 * For example, the pattern `/lib/*` will be spread into parts: '', 'lib', '*'.
	 */
	if (pattern === '') {
		return false;
	}

	/**
	 * When the `caseSensitiveMatch` option is disabled, all patterns must be marked as dynamic, because we cannot check
	 * filepath directly (without read directory).
	 */
	if (options.caseSensitiveMatch === false || pattern.includes(ESCAPE_SYMBOL)) {
		return true;
	}

	if (COMMON_GLOB_SYMBOLS_RE.test(pattern) || REGEX_CHARACTER_CLASS_SYMBOLS_RE.test(pattern) || REGEX_GROUP_SYMBOLS_RE.test(pattern)) {
		return true;
	}

	if (options.extglob !== false && GLOB_EXTENSION_SYMBOLS_RE.test(pattern)) {
		return true;
	}

	if (options.braceExpansion !== false && hasBraceExpansion(pattern)) {
		return true;
	}

	return false;
}

function hasBraceExpansion(pattern: string): boolean {
	const openingBraceIndex = pattern.indexOf('{');

	if (openingBraceIndex === -1) {
		return false;
	}

	const closingBraceIndex = pattern.indexOf('}', openingBraceIndex + 1);

	if (closingBraceIndex === -1) {
		return false;
	}

	const braceContent = pattern.slice(openingBraceIndex, closingBraceIndex);

	return BRACE_EXPANSION_SEPARATORS_RE.test(braceContent);
}

export function convertToPositivePattern(pattern: Pattern): Pattern {
	return isNegativePattern(pattern) ? pattern.slice(1) : pattern;
}

export function convertToNegativePattern(pattern: Pattern): Pattern {
	return `!${pattern}`;
}

export function isNegativePattern(pattern: Pattern): boolean {
	return pattern.startsWith('!') && pattern[1] !== '(';
}

export function isPositivePattern(pattern: Pattern): boolean {
	return !isNegativePattern(pattern);
}

export function getNegativePatterns(patterns: Pattern[]): Pattern[] {
	return patterns.filter((pattern) => isNegativePattern(pattern));
}

export function getPositivePatterns(patterns: Pattern[]): Pattern[] {
	return patterns.filter((pattern) => isPositivePattern(pattern));
}

/**
 * Returns patterns that can be applied inside the current directory.
 *
 * @example
 * // ['./*', '*', 'a/*']
 * getPatternsInsideCurrentDirectory(['./*', '*', 'a/*', '../*', './../*'])
 */
export function getPatternsInsideCurrentDirectory(patterns: Pattern[]): Pattern[] {
	return patterns.filter((pattern) => !isPatternRelatedToParentDirectory(pattern));
}

/**
 * Returns patterns to be expanded relative to (outside) the current directory.
 *
 * @example
 * // ['../*', './../*']
 * getPatternsInsideCurrentDirectory(['./*', '*', 'a/*', '../*', './../*'])
 */
export function getPatternsOutsideCurrentDirectory(patterns: Pattern[]): Pattern[] {
	return patterns.filter((pattern) => isPatternRelatedToParentDirectory(pattern));
}

export function isPatternRelatedToParentDirectory(pattern: Pattern): boolean {
	return pattern.startsWith('..') || pattern.startsWith('./..');
}

export function getBaseDirectory(pattern: Pattern): string {
	const base = globParent(pattern, { flipBackslashes: false });

	/**
	 * `glob-parent` relies on `is-glob`, which does not treat a path segment whose only glob
	 * metacharacter is an unescaped `?` as dynamic (see is-glob#21). As a result the base can still
	 * contain a dynamic segment, which makes directory traversal start from a non-existent directory
	 * (see #380). If the extracted base contains a `?`, cut it back to the segment preceding the
	 * first unescaped `?`.
	 */
	if (!base.includes(QUESTION_MARK_SYMBOL)) {
		return base;
	}

	const segmentIndex = getFirstUnescapedQuestionMarkSegmentIndex(pattern);

	if (segmentIndex === -1) {
		return base;
	}

	return segmentIndex === 0 ? '.' : pattern.split('/').slice(0, segmentIndex).join('/');
}

function getFirstUnescapedQuestionMarkSegmentIndex(pattern: Pattern): number {
	return pattern.split('/').findIndex((segment) => hasUnescapedQuestionMark(segment));
}

function hasUnescapedQuestionMark(segment: string): boolean {
	for (let index = 0; index < segment.length; index++) {
		if (segment[index] === ESCAPE_SYMBOL) {
			index++;
			continue;
		}

		if (segment[index] === QUESTION_MARK_SYMBOL) {
			return true;
		}
	}

	return false;
}

export function hasGlobStar(pattern: Pattern): boolean {
	return pattern.includes(GLOBSTAR);
}

export function hasTrailingSlashGlobStar(pattern: Pattern): boolean {
	return pattern.endsWith(`/${GLOBSTAR}`);
}

export function isAffectDepthOfReadingPattern(pattern: Pattern): boolean {
	const basename = path.basename(pattern);

	return hasTrailingSlashGlobStar(pattern) || isStaticPattern(basename);
}

export function expandPatternsWithBraceExpansion(patterns: Pattern[]): Pattern[] {
	const expandedPatterns: Pattern[] = [];

	for (const pattern of patterns) {
		expandedPatterns.push(...expandBraceExpansion(pattern));
	}

	return expandedPatterns;
}

export function expandBraceExpansion(pattern: Pattern): Pattern[] {
	const patterns = micromatch.braces(pattern, { expand: true, nodupes: true, keepEscaping: true });

	/**
	 * Sort the patterns by length so that the same depth patterns are processed side by side.
	 * `a/{b,}/{c,}/*` – `['a///*', 'a/b//*', 'a//c/*', 'a/b/c/*']`
	 */
	patterns.sort((a, b) => a.length - b.length);

	/**
	 * Micromatch can return an empty string in the case of patterns like `{a,}`.
	 */
	return patterns.filter((it) => it !== '');
}

export function getPatternParts(pattern: Pattern, options: MicromatchOptions): Pattern[] {
	let { parts } = micromatch.scan(pattern, {
		...options,
		parts: true,
	});

	/**
	 * The scan method returns an empty array in some cases.
	 * See micromatch/picomatch#58 for more details.
	 */
	if (parts.length === 0) {
		parts = [pattern];
	}

	/**
	 * The scan method does not return an empty part for the pattern with a forward slash.
	 * This is another part of micromatch/picomatch#58.
	 */
	if (parts[0].startsWith('/')) {
		parts[0] = parts[0].slice(1);
		parts.unshift('');
	}

	return parts;
}

export function makeRe(pattern: Pattern, options: MicromatchOptions): PatternRe {
	return micromatch.makeRe(pattern, options);
}

export function convertPatternsToRe(patterns: Pattern[], options: MicromatchOptions): PatternRe[] {
	return patterns.map((pattern) => makeRe(pattern, options));
}

export function isMatchAny(entry: string, patternsRe: PatternRe[]): boolean {
	return patternsRe.some((patternRe) => patternRe.test(entry));
}

/**
 * This package only works with forward slashes as a path separator.
 * Because of this, we cannot use the standard `path.normalize` method, because on Windows platform it will use of backslashes.
 */
export function removeDuplicateSlashes(pattern: string): string {
	return pattern.replaceAll(DOUBLE_SLASH_RE, '/');
}

export function partitionAbsoluteAndRelative(patterns: Pattern[]): [Pattern[], Pattern[]] {
	const absolute: Pattern[] = [];
	const relative: Pattern[] = [];

	for (const pattern of patterns) {
		if (isAbsolute(pattern)) {
			absolute.push(pattern);
		} else {
			relative.push(pattern);
		}
	}

	return [absolute, relative];
}

export function isAbsolute(pattern: string): boolean {
	return path.isAbsolute(pattern);
}
