import Matcher from './matcher';

export default class PartialMatcher extends Matcher {
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
			 * When size of the first group (minus the latest segment) greater or equals to `level`,
			 * we do not need reading the next directory, because in the next iteration,
			 * the path will have more levels than the pattern.
			 *
			 * But only if the pattern doesn't have a globstar (we must read all directories).
			 *
			 * In this cases we must trying to match other patterns.
			 */
			if (info.complete && level >= section.length - 1) {
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
}
