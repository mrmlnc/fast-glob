import * as assert from 'node:assert';

import { describe, it } from 'mocha';

import * as util from './string.js';

describe('Utils → String', () => {
	describe('.isString', () => {
		it('should return true', () => {
			const actual = util.isString('');

			assert.ok(actual);
		});

		it('should return false', () => {
			const actual = util.isString(undefined as unknown as string);

			assert.ok(!actual);
		});
	});

	describe('.isEmpty', () => {
		it('should return true', () => {
			const actual = util.isEmpty('');

			assert.ok(actual);
		});

		it('should return false', () => {
			const actual = util.isEmpty('string');

			assert.ok(!actual);
		});
	});
});
