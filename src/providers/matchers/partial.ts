import { Pattern, PatternRe, MicromatchOptions } from '../../types';
import * as utils from '../../utils';

export type PatternSection = PatternSegment[];

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

export type PatternInfo = {
	/**
	 * Indicates that the pattern has a globstar (more than a single section).
	 */
	complete: boolean;
	pattern: Pattern;
	segments: PatternSegment[];
	sections: PatternSection[];
};

export default class PartialMatcher {
	private readonly _storage: PatternInfo[] = [];

	constructor(private readonly _patterns: Pattern[], private readonly _options: MicromatchOptions) {
		this._fillStorage();
	}

	public get storage(): PatternInfo[] {
		return this._storage;
	}

	public match(level: number, part: string): boolean {
		for (const info of this._storage) {
			const section = info.sections[0];

			/**
			 * In this case, the pattern has a globstar and we must read all directories unconditionally,
			 * but only if the level has reached the end of the first group.
			 *
			 * fixtures/{a,b}/**
			 *  ^ true/false  ^ always true
			*/
			if (!info.complete && level >= section.length) {
				return true;
			}

			/**
			 * When size of the first group (minus the latest segment) equals to `level`, we do not need reading the next directory,
			 * because in the next iteration, the path will have more levels than the pattern.
			 * But only if the pattern doesn't have a globstar (we must read all directories).
			 *
			 * In this cases we must trying to match other patterns.
			 */
			if (info.complete && level === section.length - 1) {
				continue;
			}

			const segment = section[level];

			if (segment.dynamic && segment.patternRe.test(part)) {
				return true;
			}

			if (!segment.dynamic && segment.pattern === part) {
				return true;
			}
		}

		return false;
	}

	private _fillStorage(): void {
		/**
		 * The original pattern may include `{,*,**,a/*}`, which will lead to problems with matching (unresolved level).
		 * So, before expand patterns with brace expansion into separated patterns.
		 */
		const patterns = utils.pattern.expandPatternsWithBraceExpansion(this._patterns);

		for (const pattern of patterns) {
			const segments = utils.pattern.getPatternSegments(pattern, this._options);
			const sections = this._splitSegmentsIntoSections(segments);

			this._storage.push({
				complete: sections.length <= 1,
				pattern,
				segments,
				sections
			});
		}
	}

	private _splitSegmentsIntoSections(segments: PatternSegment[]): PatternSection[] {
		return utils.array.splitWhen(segments, (segment) => segment.dynamic && utils.pattern.hasGlobStar(segment.pattern));
	}
}
