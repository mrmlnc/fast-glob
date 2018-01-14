import * as assert from 'assert';

import * as util from './array';

describe('Utils → Array', () => {
	describe('.flatten', () => {
		it('should return non-nested array', () => {
			const expected: string[] = ['a', 'b'];

			const actual = util.flatten([['a'], ['b']]);

			assert.deepEqual(actual, expected);
		});
	});
});
