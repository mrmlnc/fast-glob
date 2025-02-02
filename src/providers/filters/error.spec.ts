import * as assert from 'node:assert';
import { describe, it } from 'mocha';
import Settings, { type Options } from '../../settings.js';
import * as tests from '../../tests/index.js';
import type { ErrorFilterFunction } from '../../types/index.js';
import ErrorFilter from './error.js';

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

			const isActual = filter(tests.errno.getEnoent());

			assert.ok(isActual);
		});

		it('should return true for ENOTDIR error', () => {
			const filter = getFilter();

			const isActual = filter(tests.errno.getEnotdir());

			assert.ok(isActual);
		});

		it('should return true for EPERM error when the `suppressErrors` options is enabled', () => {
			const filter = getFilter({ suppressErrors: true });

			const isActual = filter(tests.errno.getEperm());

			assert.ok(isActual);
		});

		it('should return false for EPERM error', () => {
			const filter = getFilter();

			const isActual = filter(tests.errno.getEperm());

			assert.ok(!isActual);
		});

		it('should return true for EPERM error when the `errorFilter` option returns true', () => {
			const filter = getFilter({ errorFilter: () => true });

			const isActual = filter(tests.errno.getEperm());

			assert.ok(isActual);
		});

		it('should return false for ENOENT error when the `errorFilter` option returns false', () => {
			const filter = getFilter({ errorFilter: () => false });

			const isActual = filter(tests.errno.getEnoent());

			assert.ok(!isActual);
		});

		it('should return true for EPERM error when the `suppressErrors` option is enabled and the `errorFilter` option returns false', () => {
			const filter = getFilter({ suppressErrors: true, errorFilter: () => false });

			const isActual = filter(tests.errno.getEperm());

			assert.ok(isActual);
		});
	});
});
