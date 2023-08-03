import { Pattern, MicromatchOptions } from '../../types';
import * as utils from '../../utils';
import { PatternSegment, PatternInfo } from '../../providers/matchers/matcher';

class PatternSegmentBuilder {
	private readonly _segment: PatternSegment = {
		dynamic: false,
		pattern: '',
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
			patternRe: utils.pattern.makeRe(this._segment.pattern, options),
		};
	}
}

class PatternInfoBuilder {
	private readonly _section: PatternInfo = {
		complete: true,
		pattern: '',
		segments: [],
		sections: [],
	};

	public section(...segments: PatternSegment[]): this {
		this._section.sections.push(segments);

		if (this._section.segments.length === 0) {
			this._section.complete = true;
			this._section.segments.push(...segments);
		} else {
			this._section.complete = false;
			const globstar = segment().dynamic().pattern('**').build();

			this._section.segments.push(globstar, ...segments);
		}

		return this;
	}

	public build(): PatternInfo {
		return {
			...this._section,
			pattern: this._buildPattern(),
		};
	}

	private _buildPattern(): Pattern {
		return this._section.segments.map((segment) => segment.pattern).join('/');
	}
}

export function segment(): PatternSegmentBuilder {
	return new PatternSegmentBuilder();
}

export function info(): PatternInfoBuilder {
	return new PatternInfoBuilder();
}
