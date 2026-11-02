import * as utils from '../../utils/index.js';
import type { MatcherOptions, Pattern, PatternRe } from '../../types/index.js';
import type Settings from '../../settings.js';

export type PatternSegment = DynamicPatternSegment | StaticPatternSegment;

type StaticPatternSegment = {
	dynamic: false;
	pattern: Pattern;
};

type DynamicPatternSegment = {
	dynamic: true;
	pattern: Pattern;
	patternRe: PatternRe;
};

export type PatternSection = PatternSegment[];

export type PatternInfo = {
	/**
	 * Indicates that the pattern has a globstar (more than a single section).
	 */
	complete: boolean;
	pattern: Pattern;
	segments: PatternSegment[];
	sections: PatternSection[];
};

export default abstract class Matcher {
	readonly #patterns: string[];
	readonly #settings: Settings;
	readonly #matcherOptions: MatcherOptions;

	protected readonly _storage: PatternInfo[] = [];

	constructor(patterns: Pattern[], settings: Settings, matcherOptions: MatcherOptions) {
		this.#patterns = patterns;
		this.#settings = settings;
		this.#matcherOptions = matcherOptions;

		this.#fillStorage();
	}

	#fillStorage(): void {
		for (const pattern of this.#patterns) {
			const segments = this.#getPatternSegments(pattern);
			const sections = this.#splitSegmentsIntoSections(segments);

			this._storage.push({
				complete: sections.length <= 1,
				pattern,
				segments,
				sections,
			});
		}
	}

	#getPatternSegments(pattern: Pattern): PatternSegment[] {
		const parts = utils.pattern.getPatternParts(pattern, this.#matcherOptions);

		return parts.map((part) => {
			const isDynamic = utils.pattern.isDynamicPattern(part, this.#settings);

			if (!isDynamic) {
				return {
					dynamic: false,
					pattern: part,
				};
			}

			return {
				dynamic: true,
				pattern: part,
				patternRe: utils.pattern.makeRe(part, this.#matcherOptions),
			};
		});
	}

	#splitSegmentsIntoSections(segments: PatternSegment[]): PatternSection[] {
		// Compound patterns may span directories within a single scanned segment.
		// Keep their existing conservative traversal when they contain a globstar.
		return utils.array.splitWhen(segments, (segment) => segment.dynamic && (
			(this.#settings.globstar && segment.pattern === '**')
			|| (segment.pattern.includes('/') && utils.pattern.hasGlobStar(segment.pattern))
		));
	}
}
