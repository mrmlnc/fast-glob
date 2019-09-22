import * as path from 'path';

import globParent = require('glob-parent');
import isGlob = require('is-glob');
import micromatch = require('micromatch');

import { MicromatchOptions, Pattern, PatternRe } from '../types/index';

const GLOBSTAR = '**';
const ESCAPE_SYMBOL = '\\';

export function isStaticPattern(pattern: Pattern): boolean {
	return !isDynamicPattern(pattern);
}

export function isDynamicPattern(pattern: Pattern): boolean {
	return isGlob(pattern, { strict: false }) || pattern.indexOf(ESCAPE_SYMBOL) !== -1;
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
	return globParent(pattern);
}

export function hasGlobStar(pattern: Pattern): boolean {
	return pattern.indexOf(GLOBSTAR) !== -1;
}

export function endsWithSlashGlobStar(pattern: Pattern): boolean {
	return pattern.endsWith('/' + GLOBSTAR);
}

export function isAffectDepthOfReadingPattern(pattern: Pattern): boolean {
	const basename = path.basename(pattern);

	return endsWithSlashGlobStar(pattern) || isStaticPattern(basename);
}

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

export function getMaxNaivePatternsDepth(patterns: Pattern[]): number {
	return patterns.reduce((max, pattern) => {
		const depth = getNaiveDepth(pattern);

		return depth > max ? depth : max;
	}, 0);
}

export function makeRe(pattern: Pattern, options: MicromatchOptions): PatternRe {
	return micromatch.makeRe(pattern, options);
}

export function convertPatternsToRe(patterns: Pattern[], options: MicromatchOptions): PatternRe[] {
	return patterns.map((pattern) => makeRe(pattern, options));
}

export function matchAny(entry: string, patternsRe: PatternRe[]): boolean {
	const filepath = entry.replace(/^\.[\\\/]/, '');

	return patternsRe.some((patternRe) => patternRe.test(filepath));
}
