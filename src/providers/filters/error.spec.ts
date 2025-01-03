import * as assert from 'node:assert';

import { describe, it } from 'mocha';

import Settings from '../../settings';
import * as tests from '../../tests';
import ErrorFilter from './error';

import type { ErrorFilterFunction } from '../../types';
import type { Options } from '../../settings';

function getErrorFilterInstance(options?: Options): ErrorFilter {
	const settings = new Settings(options);

	return new ErrorFilter(settings);
}

function getFilter(options?: Options): ErrorFilterFunction {
	return getErrorFilterInstance(options).getFilter();
}

describe('Providers → Filters → Error', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const filter = getErrorFilterInstance();

			assert.ok(filter instanceof ErrorFilter);
		});
	});

	describe('.getFilter', () => {
		it('should return true for ENOENT error', () => {
			const filter = getFilter();

			const actual = filter(tests.errno.getEnoent());

			assert.ok(actual);
		});

		it('should return true for EPERM error when the `suppressErrors` options is enabled', () => {
			const filter = getFilter({ suppressErrors: true });

			const actual = filter(tests.errno.getEperm());

			assert.ok(actual);
		});

		it('should return false for EPERM error', () => {
			const filter = getFilter();

			const actual = filter(tests.errno.getEperm());

			assert.ok(!actual);
		});
	});
});
