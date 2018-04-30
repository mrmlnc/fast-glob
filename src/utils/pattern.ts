import * as path from 'path';

import globParent = require('glob-parent');
import isGlob = require('is-glob');
import micromatch = require('micromatch');

import { Pattern, PatternRe } from '../types/patterns';

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
 * Return naive depth of provided pattern.
 */
export function getDepth(pattern: Pattern): number {
	return pattern.split('/').length;
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
	for (const regexp of patternsRe) {
		if (regexp.test(entry)) {
			return true;
		}
	}

	return false;
}
