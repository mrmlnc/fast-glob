import * as path from 'node:path';
import { expand as expandBraces } from 'brace-expansion';
import globParent from 'glob-parent';
import picomatch from 'picomatch';
import type { MatcherOptions, Pattern, PatternRe } from '../types/index.js';
import { IS_WINDOWS_PLATFORM } from './path.js';

const GLOBSTAR = '**';
const ESCAPE_SYMBOL = '\\';
const BRACE_EXPANSION_LITERAL_PREFIX = '\0fast_glob_brace_literal_';

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
	return globParent(pattern, { flipBackslashes: false });
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
	const openingBraceIndex = pattern.indexOf('{');

	/**
	 * Avoid parsing patterns without a brace pair, which can change quotes and escaping.
	 */
	if (openingBraceIndex === -1 || !pattern.includes('}', openingBraceIndex)) {
		return [pattern];
	}

	const [protectedPattern, literals] = protectBraceExpansionLiterals(pattern);
	const patterns = expandBraces(protectedPattern).map((expandedPattern) => restoreBraceExpansionLiterals(expandedPattern, literals));
	const uniquePatterns = [...new Set(patterns)].filter(Boolean);

	/**
	 * Sort the patterns by length so that the same depth patterns are processed side by side.
	 * `a/{b,}/{c,}/*` – `['a///*', 'a/b//*', 'a//c/*', 'a/b/c/*']`
	 */
	return uniquePatterns.toSorted((a, b) => a.length - b.length);
}

function protectBraceExpansionLiterals(pattern: Pattern): [Pattern, string[]] {
	const literals: string[] = [];
	let protectedPattern = '';
	let index = 0;

	const addLiteral = (literal: string): void => {
		protectedPattern += `${BRACE_EXPANSION_LITERAL_PREFIX}${literals.length}\0`;
		literals.push(literal);
	};

	while (index < pattern.length) {
		const character = pattern[index];

		if (character === ESCAPE_SYMBOL) {
			addLiteral(pattern.slice(index, index + 2));
			index += 2;
			continue;
		}

		if (['"', '\'', '`'].includes(character)) {
			const [value, nextIndex] = readQuotedBraceExpansionLiteral(pattern, index + 1, character);

			index = nextIndex;
			addLiteral(value);
			continue;
		}

		protectedPattern += character;
		index++;
	}

	return [protectedPattern, literals];
}

function readQuotedBraceExpansionLiteral(pattern: Pattern, index: number, quote: string): [string, number] {
	let value = '';

	while (index < pattern.length) {
		const character = pattern[index++];

		if (character === ESCAPE_SYMBOL && index < pattern.length) {
			value += character + pattern[index++];
		} else if (character === quote) {
			return [value, index];
		} else {
			value += character;
		}
	}

	return [value, index];
}

function restoreBraceExpansionLiterals(pattern: Pattern, literals: string[]): Pattern {
	for (const [index, literal] of literals.entries()) {
		pattern = pattern.replaceAll(`${BRACE_EXPANSION_LITERAL_PREFIX}${index}\0`, () => literal);
	}

	return pattern;
}

export function getPatternParts(pattern: Pattern, options: MatcherOptions): Pattern[] {
	const { parts = [] } = picomatch.scan(pattern, { ...options, parts: true });

	/**
	 * A trailing slash marks a directory and must not add another level of traversal.
	 */
	if (parts.at(-1) === '') {
		parts.pop();
	}

	/**
	 * Preserve the original pattern when no parts remain, for example, for an empty string or `./`.
	 */
	if (parts.length === 0) {
		return [pattern];
	}

	return parts;
}

export function makeRe(pattern: Pattern, options: MatcherOptions): PatternRe {
	// The picomatch does not detect the platform automatically.
	return picomatch.makeRe(pattern, { ...options, windows: IS_WINDOWS_PLATFORM });
}

export function convertPatternsToRe(patterns: Pattern[], options: MatcherOptions): PatternRe[] {
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
