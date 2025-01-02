import * as assert from 'node:assert';

import { describe, it } from 'mocha';

import * as tests from '../tests/index.js';
import * as util from './errno.js';

describe('Utils → Errno', () => {
	describe('.isEnoentCodeError', () => {
		it('should return true for ENOENT error', () => {
			assert.ok(util.isEnoentCodeError(tests.errno.getEnoent()));
		});

		it('should return false for EPERM error', () => {
			assert.ok(!util.isEnoentCodeError(tests.errno.getEperm()));
		});
	});
});
