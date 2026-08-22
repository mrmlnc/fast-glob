import * as assert from 'node:assert';
import { describe, it } from 'mocha';
import * as util from './string.js';

describe('Utils → String', () => {
	describe('.isString', () => {
		it('should return true', () => {
			assert.ok(util.isString(''));
		});

		it('should return false', () => {
			assert.ok(!util.isString(undefined));
		});
	});

	describe('.isEmpty', () => {
		it('should return true', () => {
			assert.ok(util.isEmpty(''));
		});

		it('should return false', () => {
			assert.ok(!util.isEmpty('string'));
		});
	});
});
