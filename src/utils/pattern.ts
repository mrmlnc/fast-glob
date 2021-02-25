import * as path from 'path';

import * as globParent from '@snyk/glob-parent';
import * as micromatch from 'micromatch';
import * as picomatch from 'picomatch';

import { MicromatchOptions, Pattern, PatternRe } from '../types';

const GLOBSTAR = '**';
const ESCAPE_SYMBOL = '\\';

const COMMON_GLOB_SYMBOLS_RE = /[*?]|^!/;
const REGEX_CHARACTER_CLASS_SYMBOLS_RE = /\[.*]/;
const REGEX_GROUP_SYMBOLS_RE = /(?:^|[^!*+?@])\(.*\|.*\)/;
const GLOB_EXTENSION_SYMBOLS_RE = /[!*+?@]\(.*\)/;
const BRACE_EXPANSIONS_SYMBOLS_RE = /{.*(?:,|\.\.).*}/;

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

	if (options.braceExpansion !== false && BRACE_EXPANSIONS_SYMBOLS_RE.test(pattern)) {
		return true;
	}

	return false;
}

export function convertToPositivePattern(pattern: Pattern): Pattern {
	return isNegativePattern(pattern) ? pattern.slice(1) : pattern;
}

export function convertToNegativePattern(pattern: Pattern): Pattern {
	return '!' + pattern;
}

export function isNegativePattern(pattern: Pattern): boolean {
	return pattern.startsWith('!') && pattern[1] !== '(';
}

export function isPositivePattern(pattern: Pattern): boolean {
	return !isNegativePattern(pattern);
}

export function getNegativePatterns(patterns: Pattern[]): Pattern[] {
	return patterns.filter(isNegativePattern);
}

export function getPositivePatterns(patterns: Pattern[]): Pattern[] {
	return patterns.filter(isPositivePattern);
}

export function getBaseDirectory(pattern: Pattern): string {
	return globParent(pattern, { flipBackslashes: false });
}

export function hasGlobStar(pattern: Pattern): boolean {
	return pattern.includes(GLOBSTAR);
}

export function endsWithSlashGlobStar(pattern: Pattern): boolean {
	return pattern.endsWith('/' + GLOBSTAR);
}

export function isAffectDepthOfReadingPattern(pattern: Pattern): boolean {
	const basename = path.basename(pattern);

	return endsWithSlashGlobStar(pattern) || isStaticPattern(basename);
}

export function expandPatternsWithBraceExpansion(patterns: Pattern[]): Pattern[] {
	return patterns.reduce((collection, pattern) => {
		return collection.concat(expandBraceExpansion(pattern));
	}, [] as Pattern[]);
}

export function expandBraceExpansion(pattern: Pattern): Pattern[] {
	return micromatch.braces(pattern, {
		expand: true,
		nodupes: true
	});
}

export function getPatternParts(pattern: Pattern, options: MicromatchOptions): Pattern[] {
	let { parts } = picomatch.scan(pattern, {
		...options,
		parts: true
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

export function matchAny(entry: string, patternsRe: PatternRe[]): boolean {
	return patternsRe.some((patternRe) => patternRe.test(entry));
}
