import * as assert from 'node:assert';

import * as util from './array';

describe('Utils → Array', () => {
	describe('.flatten', () => {
		it('should return non-nested array', () => {
			const expected = ['a', 'b'];

			const actual = util.flatten([['a'], ['b']]);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.splitWhen', () => {
		it('should return one group', () => {
			const expected = [[1, 2]];

			const actual = util.splitWhen([1, 2], () => false);

			assert.deepStrictEqual(actual, expected);
		});

		it('should return group for each item of array', () => {
			const expected = [[], [], [], []];

			const actual = util.splitWhen([1, 2, 3], () => true);

			assert.deepStrictEqual(actual, expected);
		});

		it('should return two group', () => {
			const expected = [[1, 2], [4, 5]];

			const actual = util.splitWhen([1, 2, 3, 4, 5], (item) => item === 3);

			assert.deepStrictEqual(actual, expected);
		});
	});
});
