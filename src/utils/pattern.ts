import globParent = require('glob-parent');

import { TPattern } from '../types/patterns';

/**
 * Returns negative pattern as positive pattern.
 */
export function convertToPositivePattern(pattern: TPattern): TPattern {
	return pattern.slice(1);
}

/**
 * Returns positive pattern as negative pattern.
 */
export function convertToNegativePattern(pattern: TPattern): TPattern {
	return '!' + pattern;
}

/**
 * Return true if provided pattern is negative pattern.
 */
export function isNegativePattern(pattern: TPattern): boolean {
	return pattern.startsWith('!');
}

/**
 * Return true if provided pattern is positive pattern.
 */
export function isPositivePattern(pattern: TPattern): boolean {
	return !isNegativePattern(pattern);
}

/**
 * Extracts negative patterns from array of patterns.
 */
export function getNegativePatterns(patterns: TPattern[]): TPattern[] {
	return patterns.filter(isNegativePattern);
}

/**
 * Extracts positive patterns from array of patterns.
 */
export function getPositivePatterns(patterns: TPattern[]): TPattern[] {
	return patterns.filter(isPositivePattern);
}

/**
 * Extract base directory from provided pattern.
 */
export function getBaseDirectory(pattern: TPattern): string {
	return globParent(pattern);
}
