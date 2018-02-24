import * as assert from 'assert';

import * as util from './path';

describe('Utils → Path', () => {
	describe('.isDotDirectory', () => {
		it('should return true for dot directory', () => {
			const actual = util.isDotDirectory('fixtures/.directory');

			assert.ok(actual);
		});

		it('should return false for non-dot directory', () => {
			const actual = util.isDotDirectory('fixtures/.directory/directory');

			assert.ok(!actual);
		});
	});

	describe('.getDepth', () => {
		it('should returns 4', () => {
			const expected: number = 4;

			const actual = util.getDepth('a/b/c/d.js');

			assert.equal(actual, expected);
		});
	});
});
