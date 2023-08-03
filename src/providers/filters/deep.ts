import * as utils from '../../utils';
import PartialMatcher from '../matchers/partial';

import type { MicromatchOptions, Entry, EntryFilterFunction, Pattern, PatternRe } from '../../types';
import type Settings from '../../settings';

export default class DeepFilter {
	readonly #settings: Settings;
	readonly #micromatchOptions: MicromatchOptions;

	constructor(settings: Settings, micromatchOptions: MicromatchOptions) {
		this.#settings = settings;
		this.#micromatchOptions = micromatchOptions;
	}

	public getFilter(basePath: string, positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const matcher = this.#getMatcher(positive);
		const negativeRe = this.#getNegativePatternsRe(negative);

		return (entry) => this.#filter(basePath, entry, matcher, negativeRe);
	}

	#getMatcher(patterns: Pattern[]): PartialMatcher {
		return new PartialMatcher(patterns, this.#settings, this.#micromatchOptions);
	}

	#getNegativePatternsRe(patterns: Pattern[]): PatternRe[] {
		const affectDepthOfReadingPatterns = patterns.filter((pattern) => utils.pattern.isAffectDepthOfReadingPattern(pattern));

		return utils.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this.#micromatchOptions);
	}

	#filter(basePath: string, entry: Entry, matcher: PartialMatcher, negativeRe: PatternRe[]): boolean {
		if (this.#isSkippedByDeep(basePath, entry.path)) {
			return false;
		}

		if (this.#isSkippedSymbolicLink(entry)) {
			return false;
		}

		const filepath = utils.path.removeLeadingDotSegment(entry.path);

		if (this.#isSkippedByPositivePatterns(filepath, matcher)) {
			return false;
		}

		return this.#isSkippedByNegativePatterns(filepath, negativeRe);
	}

	#isSkippedByDeep(basePath: string, entryPath: string): boolean {
		/**
		 * Avoid unnecessary depth calculations when it doesn't matter.
		 */
		if (this.#settings.deep === Number.POSITIVE_INFINITY) {
			return false;
		}

		return this.#getEntryLevel(basePath, entryPath) >= this.#settings.deep;
	}

	#getEntryLevel(basePath: string, entryPath: string): number {
		const entryPathDepth = entryPath.split('/').length;

		if (basePath === '') {
			return entryPathDepth;
		}

		const basePathDepth = basePath.split('/').length;

		return entryPathDepth - basePathDepth;
	}

	#isSkippedSymbolicLink(entry: Entry): boolean {
		return !this.#settings.followSymbolicLinks && entry.dirent.isSymbolicLink();
	}

	#isSkippedByPositivePatterns(entryPath: string, matcher: PartialMatcher): boolean {
		return !this.#settings.baseNameMatch && !matcher.match(entryPath);
	}

	#isSkippedByNegativePatterns(entryPath: string, patternsRe: PatternRe[]): boolean {
		return !utils.pattern.matchAny(entryPath, patternsRe);
	}
}
