import * as assert from 'assert';

import { Pattern, MicromatchOptions } from '../../types';
import Matcher from './partial';

function getMatcher(patterns: Pattern[], options: MicromatchOptions = {}): Matcher {
	return new Matcher(patterns, options);
}

function assertMatch(patterns: Pattern[], level: number, part: string): void | never {
	const matcher = getMatcher(patterns);

	assert.ok(matcher.match(level, part));
}

function assertNotMatch(patterns: Pattern[], level: number, part: string): void | never {
	const matcher = getMatcher(patterns);

	assert.ok(!matcher.match(level, part));
}

describe('Providers → Matchers → Partial', () => {
	describe('.match', () => {
		it('should handle patterns with globstar', () => {
			assertMatch(['**'], 0, 'a');
			assertMatch(['**'], 1, 'b');
			assertMatch(['**/a'], 0, 'a');
			assertMatch(['**/a'], 1, 'a');
			assertNotMatch(['a/**'], 0, 'b');
			assertMatch(['a/**'], 1, 'b');
		});

		it('should do not match the latest segment', () => {
			assertMatch(['b', 'b/*'], 0, 'b');
			assertNotMatch(['*'], 0, 'a');
			assertNotMatch(['a/*'], 1, 'b');
		});

		it('should trying to match all patterns', () => {
			assertMatch(['a/*', 'b/*'], 0, 'b');
		});

		it('should match a static segment', () => {
			assertMatch(['a/b'], 0, 'a');
			assertNotMatch(['b/b'], 0, 'a');
		});

		it('should match a dynamic segment', () => {
			assertMatch(['*/b'], 0, 'a');
			assertMatch(['{a,b}/*'], 0, 'a');
			assertNotMatch(['{a,b}/*'], 0, 'c');
		});
	});
});
