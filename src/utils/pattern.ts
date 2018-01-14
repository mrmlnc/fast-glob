import globParent = require('glob-parent');

import { Pattern } from '../types/patterns';

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
