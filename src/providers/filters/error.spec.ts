import * as assert from 'assert';

import type { Options } from '../../settings';
import Settings from '../../settings';
import * as tests from '../../tests';
import type { ErrorFilterFunction } from '../../types';
import ErrorFilter from './error';

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
