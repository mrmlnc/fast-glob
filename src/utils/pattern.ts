import globParent = require('glob-parent');
import micromatch = require('micromatch');

import { Pattern, PatternRe } from '../types/patterns';

/**
 * Returns negative pattern as positive pattern.
 */
export function convertToPositivePattern(pattern: Pattern): Pattern {
	return pattern.slice(1);
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
	return pattern.startsWith('!');
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
	return pattern.indexOf('**') !== -1;
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

/**
 * Returns true if the entry doesn't match any of the given negative RegExp's and match any of the given positive RegExp's.
 */
export function match(entry: string, positiveRe: PatternRe[], negativeRe: PatternRe[]): boolean {
	return matchAny(entry, negativeRe) ? false : matchAny(entry, positiveRe);
}
