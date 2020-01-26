import { PatternSegment, Pattern, MicromatchOptions } from '../../types';
import * as utils from '../../utils';

class PatternSegmentBuilder {
	private readonly _segment: PatternSegment = {
		dynamic: false,
		pattern: ''
	};

	public dynamic(): this {
		this._segment.dynamic = true;

		return this;
	}

	public pattern(pattern: Pattern): this {
		this._segment.pattern = pattern;

		return this;
	}

	public build(options: MicromatchOptions = {}): PatternSegment {
		if (!this._segment.dynamic) {
			return this._segment;
		}

		return {
			...this._segment,
			patternRe: utils.pattern.makeRe(this._segment.pattern, options)
		};
	}
}

export function segment(): PatternSegmentBuilder {
	return new PatternSegmentBuilder();
}
