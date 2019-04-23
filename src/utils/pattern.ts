import * as path from 'path';

import globParent = require('glob-parent');
import isGlob = require('is-glob');
import micromatch = require('micromatch');

import { Pattern, PatternRe } from '../types/index';

const GLOBSTAR = '**';

/**
 * Return true for static pattern.
 */
export function isStaticPattern(pattern: Pattern): boolean {
	return !isDynamicPattern(pattern);
}

/**
 * Return true for pattern that looks like glob.
 */
export function isDynamicPattern(pattern: Pattern): boolean {
	return isGlob(pattern);
}

/**
 * Convert a windows «path» to a unix-style «path».
 */
export function unixifyPattern(pattern: Pattern): Pattern {
	return pattern.replace(/\\/g, '/');
}

/**
 * Returns negative pattern as positive pattern.
 */
export function convertToPositivePattern(pattern: Pattern): Pattern {
	return isNegativePattern(pattern) ? pattern.slice(1) : pattern;
}

/**
 * Returns positive pattern as negative pattern.
 */
export function convertToNegativePattern(pattern: Pattern): Pattern {
	return '!' + pattern;
}

/**
 * Return true if provided pattern is negative pattern.
 */
export function isNegativePattern(pattern: Pattern): boolean {
	return pattern.startsWith('!') && pattern[1] !== '(';
}

/**
 * Return true if provided pattern is positive pattern.
 */
export function isPositivePattern(pattern: Pattern): boolean {
	return !isNegativePattern(pattern);
}

/**
 * Extracts negative patterns from array of patterns.
 */
export function getNegativePatterns(patterns: Pattern[]): Pattern[] {
	return patterns.filter(isNegativePattern);
}

/**
 * Extracts positive patterns from array of patterns.
 */
export function getPositivePatterns(patterns: Pattern[]): Pattern[] {
	return patterns.filter(isPositivePattern);
}

/**
 * Extract base directory from provided pattern.
 */
export function getBaseDirectory(pattern: Pattern): string {
	return globParent(pattern);
}

/**
 * Return true if provided pattern has globstar.
 */
export function hasGlobStar(pattern: Pattern): boolean {
	return pattern.indexOf(GLOBSTAR) !== -1;
}

/**
 * Return true if provided pattern ends with slash and globstar.
 */
export function endsWithSlashGlobStar(pattern: Pattern): boolean {
	return pattern.endsWith('/' + GLOBSTAR);
}

/**
 * Returns «true» when pattern ends with a slash and globstar or the last partial of the pattern is static pattern.
 */
export function isAffectDepthOfReadingPattern(pattern: Pattern): boolean {
	const basename = path.basename(pattern);

	return endsWithSlashGlobStar(pattern) || isStaticPattern(basename);
}

/**
 * Return naive depth of provided pattern without depth of the base directory.
 */
export function getNaiveDepth(pattern: Pattern): number {
	const base = getBaseDirectory(pattern);

	const patternDepth = pattern.split('/').length;
	const patternBaseDepth = base.split('/').length;

	/**
	 * This is a hack for pattern that has no base directory.
	 *
	 * This is related to the `*\something\*` pattern.
	 */
	if (base === '.') {
		return patternDepth - patternBaseDepth;
	}

	return patternDepth - patternBaseDepth - 1;
}

/**
 * Return max naive depth of provided patterns without depth of the base directory.
 */
export function getMaxNaivePatternsDepth(patterns: Pattern[]): number {
	return patterns.reduce((max, pattern) => {
		const depth = getNaiveDepth(pattern);

		return depth > max ? depth : max;
	}, 0);
}

/**
 * Make RegExp for provided pattern.
 */
export function makeRe(pattern: Pattern, options: micromatch.Options): PatternRe {
	return micromatch.makeRe(pattern, options);
}

/**
 * Convert patterns to regexps.
 */
export function convertPatternsToRe(patterns: Pattern[], options: micromatch.Options): PatternRe[] {
	return patterns.map((pattern) => makeRe(pattern, options));
}

/**
 * Returns true if the entry match any of the given RegExp's.
 */
export function matchAny(entry: string, patternsRe: PatternRe[]): boolean {
	const filepath = entry.replace(/^\.(\\\\|\/)/g, '');

	return patternsRe.some((patternRe) => patternRe.test(filepath));
}
