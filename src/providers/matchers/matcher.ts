import { Pattern, MicromatchOptions, PatternRe } from '../../types';
import * as utils from '../../utils';
import Settings from '../../settings';

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

	constructor(private readonly _patterns: Pattern[], private readonly _settings: Settings, private readonly _micromatchOptions: MicromatchOptions) {
		this._fillStorage();
	}

	private _fillStorage(): void {
		for (const pattern of this._patterns) {
			const segments = this._getPatternSegments(pattern);
			const sections = this._splitSegmentsIntoSections(segments);

			this._storage.push({
				complete: sections.length <= 1,
				pattern,
				segments,
				sections,
			});
		}
	}

	private _getPatternSegments(pattern: Pattern): PatternSegment[] {
		const parts = utils.pattern.getPatternParts(pattern, this._micromatchOptions);

		return parts.map((part) => {
			const dynamic = utils.pattern.isDynamicPattern(part, this._settings);

			if (!dynamic) {
				return {
					dynamic: false,
					pattern: part,
				};
			}

			return {
				dynamic: true,
				pattern: part,
				patternRe: utils.pattern.makeRe(part, this._micromatchOptions),
			};
		});
	}

	private _splitSegmentsIntoSections(segments: PatternSegment[]): PatternSection[] {
		return utils.array.splitWhen(segments, (segment) => segment.dynamic && utils.pattern.hasGlobStar(segment.pattern));
	}
}
