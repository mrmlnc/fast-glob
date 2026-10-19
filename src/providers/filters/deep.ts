import * as utils from '../../utils/index.js';
import PartialMatcher from '../matchers/partial.js';
import type {
	MatcherOptions,
	Entry,
	EntryFilterFunction,
	Pattern,
	PatternRe,
} from '../../types/index.js';
import type Settings from '../../settings.js';

type NegativePatterns = {
	absolute: PatternRe[];
	relative: PatternRe[];
};

export default class DeepFilter {
	readonly #settings: Settings;
	readonly #matcherOptions: MatcherOptions;

	constructor(settings: Settings, matcherOptions: MatcherOptions) {
		this.#settings = settings;
		this.#matcherOptions = matcherOptions;
	}

	#getMatcher(patterns: Pattern[]): PartialMatcher {
		return new PartialMatcher(patterns, this.#settings, this.#matcherOptions);
	}

	#getNegativePatternsRe(patterns: Pattern[]): PatternRe[] {
		const affectDepthOfReadingPatterns = patterns.filter((pattern) => utils.pattern.isAffectDepthOfReadingPattern(pattern));

		return utils.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this.#matcherOptions);
	}

	#filter(basePath: string, entry: Entry, matcher: PartialMatcher, negativeRe: NegativePatterns): boolean {
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
		if (this.#settings.deep === Infinity) {
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

	#isSkippedByNegativePatterns(entryPath: string, patternsRe: NegativePatterns): boolean {
		if (patternsRe.relative.length > 0) {
			const relativePath = utils.path.makeRelative(this.#settings.cwd, entryPath);
			if (utils.pattern.isMatchAny(relativePath, patternsRe.relative)) {
				return false;
			}
		}

		if (patternsRe.absolute.length > 0) {
			const absolutePath = utils.path.makeAbsolute(this.#settings.cwd, entryPath);
			if (utils.pattern.isMatchAny(absolutePath, patternsRe.absolute)) {
				return false;
			}
		}

		return true;
	}

	public getFilter(basePath: string, positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const matcher = this.#getMatcher(positive);
		const [absolute, relative] = utils.pattern.partitionAbsoluteAndRelative(negative);
		const negativeRe = {
			absolute: this.#getNegativePatternsRe(absolute),
			relative: this.#getNegativePatternsRe(relative),
		};

		return (entry) => this.#filter(basePath, entry, matcher, negativeRe);
	}
}
