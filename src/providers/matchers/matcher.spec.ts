import * as assert from 'assert';

import * as tests from '../../tests';
import Settings from '../../settings';
import Matcher from './matcher';

import type { Pattern, MicromatchOptions } from '../../types';
import type { PatternInfo } from './matcher';


class TestMatcher extends Matcher {
	public get storage(): PatternInfo[] {
		return this._storage;
	}
}

function getMatcher(patterns: Pattern[], options: MicromatchOptions = {}): TestMatcher {
	return new TestMatcher(patterns, new Settings(), options);
}

describe('Providers → Matchers → Matcher', () => {
	describe('.storage', () => {
		it('should return created storage', () => {
			const matcher = getMatcher(['a*', 'a/**/b']);

			const expected: PatternInfo[] = [
				tests.pattern.info()
					.section(tests.pattern.segment().dynamic().pattern('a*').build())
					.build(),
				tests.pattern.info()
					.section(tests.pattern.segment().pattern('a').build())
					.section(tests.pattern.segment().pattern('b').build())
					.build(),
			];

			const actual = matcher.storage;

			assert.deepStrictEqual(actual, expected);
		});
	});
});
