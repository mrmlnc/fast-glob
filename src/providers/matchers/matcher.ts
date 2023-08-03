import * as utils from '../../utils';

import type { MicromatchOptions, Pattern, PatternRe } from '../../types';
import type Settings from '../../settings';

export type PatternSegment = DynamicPatternSegment | StaticPatternSegment;

interface StaticPatternSegment {
	dynamic: false;
	pattern: Pattern;
}

interface DynamicPatternSegment {
	dynamic: true;
	pattern: Pattern;
	patternRe: PatternRe;
}

export type PatternSection = PatternSegment[];

export interface PatternInfo {
	/**
	 * Indicates that the pattern has a globstar (more than a single section).
	 */
	complete: boolean;
	pattern: Pattern;
	segments: PatternSegment[];
	sections: PatternSection[];
}

export default abstract class Matcher {
	protected readonly _storage: PatternInfo[] = [];

	readonly #patterns: string[];
	readonly #settings: Settings;
	readonly #micromatchOptions: MicromatchOptions;

	constructor(patterns: Pattern[], settings: Settings, micromatchOptions: MicromatchOptions) {
		this.#patterns = patterns;
		this.#settings = settings;
		this.#micromatchOptions = micromatchOptions;

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
		const parts = utils.pattern.getPatternParts(pattern, this.#micromatchOptions);

		return parts.map((part) => {
			const dynamic = utils.pattern.isDynamicPattern(part, this.#settings);

			if (!dynamic) {
				return {
					dynamic: false,
					pattern: part,
				};
			}

			return {
				dynamic: true,
				pattern: part,
				patternRe: utils.pattern.makeRe(part, this.#micromatchOptions),
			};
		});
	}

	#splitSegmentsIntoSections(segments: PatternSegment[]): PatternSection[] {
		return utils.array.splitWhen(segments, (segment) => segment.dynamic && utils.pattern.hasGlobStar(segment.pattern));
	}
}
