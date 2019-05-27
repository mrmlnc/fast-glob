import * as assert from 'assert';

import Settings, { Options } from '../../settings';
import { ErrnoException, ErrorFilterFunction } from '../../types/index';
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
		it('should return false when the `suppressErrors` option is disabled', () => {
			const filter = getFilter();

			const actual = filter({} as ErrnoException);

			assert.ok(!actual);
		});

		it('should return true when the `suppressErrors` option is enabled', () => {
			const filter = getFilter({ suppressErrors: true });

			const actual = filter({} as ErrnoException);

			assert.ok(actual);
		});
	});
});
