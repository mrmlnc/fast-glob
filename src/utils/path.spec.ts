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
});
