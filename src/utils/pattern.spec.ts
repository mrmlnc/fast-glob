import * as assert from 'assert';

import * as util from './pattern';

import { TPattern } from '../types/patterns';

describe('Utils → Pattern', () => {
	describe('.convertToPositivePattern', () => {
		it('should returns converted positive pattern', () => {
			const expected: TPattern = '*.js';

			const actual = util.convertToPositivePattern('!*.js');

			assert.equal(actual, expected);
		});
	});

	describe('.convertToNegativePattern', () => {
		it('should returns converted negative pattern', () => {
			const expected: TPattern = '!*.js';

			const actual = util.convertToNegativePattern('*.js');

			assert.equal(actual, expected);
		});
	});

	describe('.isNegativePattern', () => {
		it('should returns true', () => {
			const actual = util.isNegativePattern('!*.md');

			assert.ok(actual);
		});

		it('should returns false', () => {
			const actual = util.isNegativePattern('*.md');

			assert.ok(!actual);
		});
	});

	describe('.isPositivePattern', () => {
		it('should returns true', () => {
			const actual = util.isPositivePattern('*.md');

			assert.ok(actual);
		});

		it('should returns false', () => {
			const actual = util.isPositivePattern('!*.md');

			assert.ok(!actual);
		});
	});

	describe('.getNegativePatterns', () => {
		it('should returns only negative patterns', () => {
			const expected: TPattern[] = ['!*.spec.js'];

			const actual = util.getNegativePatterns(['*.js', '!*.spec.js', '*.ts']);

			assert.deepEqual(actual, expected);
		});

		it('should returns empty array', () => {
			const expected: TPattern[] = [];

			const actual = util.getNegativePatterns(['*.js', '*.ts']);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.getPositivePatterns', () => {
		it('should returns only positive patterns', () => {
			const expected: TPattern[] = ['*.js', '*.ts'];

			const actual = util.getPositivePatterns(['*.js', '!*.spec.js', '*.ts']);

			assert.deepEqual(actual, expected);
		});

		it('should returns empty array', () => {
			const expected: TPattern[] = [];

			const actual = util.getPositivePatterns(['!*.js', '!*.ts']);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.getBaseDirectory', () => {
		it('should returns base directory', () => {
			const expected = 'root';

			const actual = util.getBaseDirectory('root/*.js');

			assert.equal(actual, expected);
		});
	});
});
