import * as utils from '../../utils';

import type { Pattern, MicromatchOptions } from '../../types';
import type { PatternSegment, PatternInfo } from '../../providers/matchers/matcher';

class PatternSegmentBuilder {
	readonly #segment: PatternSegment = {
		dynamic: false,
		pattern: '',
	};

	public dynamic(): this {
		this.#segment.dynamic = true;

		return this;
	}

	public pattern(pattern: Pattern): this {
		this.#segment.pattern = pattern;

		return this;
	}

	public build(options: MicromatchOptions = {}): PatternSegment {
		if (!this.#segment.dynamic) {
			return this.#segment;
		}

		return {
			...this.#segment,
			patternRe: utils.pattern.makeRe(this.#segment.pattern, options),
		};
	}
}

class PatternInfoBuilder {
	readonly #section: PatternInfo = {
		complete: true,
		pattern: '',
		segments: [],
		sections: [],
	};

	public section(...segments: PatternSegment[]): this {
		this.#section.sections.push(segments);

		if (this.#section.segments.length === 0) {
			this.#section.complete = true;
			this.#section.segments.push(...segments);
		} else {
			this.#section.complete = false;
			const globstar = segment().dynamic().pattern('**').build();

			this.#section.segments.push(globstar, ...segments);
		}

		return this;
	}

	public build(): PatternInfo {
		return {
			...this.#section,
			pattern: this.#buildPattern(),
		};
	}

	#buildPattern(): Pattern {
		return this.#section.segments.map((segment) => segment.pattern).join('/');
	}
}

export function segment(): PatternSegmentBuilder {
	return new PatternSegmentBuilder();
}

export function info(): PatternInfoBuilder {
	return new PatternInfoBuilder();
}
