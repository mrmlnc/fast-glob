'use strict';

import * as assert from 'assert';

import * as patterns from './patterns';

describe('Utils/Patterns', () => {

	it('isNegative', () => {
		assert.ok(patterns.isNegative('!**/*.txt'));
		assert.ok(!patterns.isNegative('**/*.txt'));
	});

	it('getNegativeAsPositive', () => {
		assert.deepEqual(patterns.getNegativeAsPositive(['!**/*.txt', '**/*.txt']), ['**/*.txt']);
	});

});
