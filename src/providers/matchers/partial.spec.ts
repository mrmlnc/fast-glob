import * as assert from 'assert';

import Settings from '../../settings';
import Matcher from './partial';

import type { Pattern, MicromatchOptions } from '../../types';

function getMatcher(patterns: Pattern[], options: MicromatchOptions = {}): Matcher {
	return new Matcher(patterns, new Settings(), options);
}

function assertMatch(patterns: Pattern[], filepath: string): never | void {
	const matcher = getMatcher(patterns);

	assert.ok(matcher.match(filepath), `Path "${filepath}" should match: ${patterns}`);
}

function assertNotMatch(patterns: Pattern[], filepath: string): never | void {
	const matcher = getMatcher(patterns);

	assert.ok(!matcher.match(filepath), `Path "${filepath}" should do not match: ${patterns}`);
}

describe('Providers → Matchers → Partial', () => {
	describe('.match', () => {
		it('should handle patterns with globstar', () => {
			assertMatch(['**'], 'a');
			assertMatch(['**'], './a');
			assertMatch(['**/a'], 'a');
			assertMatch(['**/a'], 'b/a');
			assertMatch(['a/**'], 'a/b');
			assertNotMatch(['a/**'], 'b');
		});

		it('should do not match the latest segment', () => {
			assertMatch(['b/*'], 'b');
			assertNotMatch(['*'], 'a');
			assertNotMatch(['a/*'], 'a/b');
		});

		it('should trying to match all patterns', () => {
			assertMatch(['a/*', 'b/*'], 'b');
			assertMatch(['non-match/b/c', 'a/*/c'], 'a/b');
			assertNotMatch(['non-match/d/c', 'a/b/c'], 'a/d');
		});

		it('should match a static segment', () => {
			assertMatch(['a/b'], 'a');
			assertNotMatch(['b/b'], 'a');
		});

		it('should match a dynamic segment', () => {
			assertMatch(['*/b'], 'a');
			assertMatch(['{a,b}/*'], 'a');
			assertNotMatch(['{a,b}/*'], 'c');
		});
	});
});
