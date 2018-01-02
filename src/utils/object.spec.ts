import * as assert from 'assert';

import * as util from './object';

describe('Utils → Object', () => {
	describe('.values', () => {
		it('should returns values from provided array', () => {
			const expected: string[] = ['a', 'b'];

			const actual = util.values({ a: 'a', b: 'b' });

			assert.deepEqual(actual, expected);
		});
	});
});
