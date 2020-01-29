import { Pattern, MicromatchOptions, PatternRe } from '../../types';
import * as utils from '../../utils';

export type PatternSegment = StaticPatternSegment | DynamicPatternSegment;

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
	protected readonly _storage: PatternInfo[] = [];

	constructor(private readonly _patterns: Pattern[], private readonly _options: MicromatchOptions) {
		this._fillStorage();
	}

	private _fillStorage(): void {
		/**
		 * The original pattern may include `{,*,**,a/*}`, which will lead to problems with matching (unresolved level).
		 * So, before expand patterns with brace expansion into separated patterns.
		 */
		const patterns = utils.pattern.expandPatternsWithBraceExpansion(this._patterns);

		for (const pattern of patterns) {
			const segments = this._getPatternSegments(pattern);
			const sections = this._splitSegmentsIntoSections(segments);

			this._storage.push({
				complete: sections.length <= 1,
				pattern,
				segments,
				sections
			});
		}
	}

	private _getPatternSegments(pattern: Pattern): PatternSegment[] {
		const parts = utils.pattern.getPatternParts(pattern, this._options);

		return parts.map((part) => {
			const dynamic = utils.pattern.isDynamicPattern(part);

			if (!dynamic) {
				return {
					dynamic: false,
					pattern: part
				};
			}

			return {
				dynamic: true,
				pattern: part,
				patternRe: utils.pattern.makeRe(part, this._options)
			};
		});
	}

	private _splitSegmentsIntoSections(segments: PatternSegment[]): PatternSection[] {
		return utils.array.splitWhen(segments, (segment) => segment.dynamic && utils.pattern.hasGlobStar(segment.pattern));
	}
}
