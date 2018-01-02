import * as assert from 'assert';

import Reporter from './reporter';
import { ISuitePackResult } from './runner';

describe('Benchmark → Reporter', () => {
	const results: ISuitePackResult = {
		name: 'name',
		errors: 0,
		retries: 1,
		entries: 1,
		measures: {
			time: { raw: [1, 1, 1], average: 1, stdev: 0, units: 'ms' },
			memory: { raw: [1, 1, 1], average: 1, stdev: 0, units: 'MB' }
		}
	};

	afterEach(() => {
		results.errors = 0;
	});

	describe('.toString', () => {
		it('should returns report', () => {
			const reporter = new Reporter(results);

			const expected: string = 'name\n(TIME) 1.000ms ±0.000% | (MEMORY) 1.000MB ±0.000% | Entries: 1 | Errors: 0 | Retries: 1';

			const actual = reporter.toString();

			assert.equal(actual, expected);
		});

		it('should returns report with errors', () => {
			results.errors = 1;

			const reporter = new Reporter(results);

			const expected: string = 'name\n(TIME) 1.000ms ±0.000% | (MEMORY) 1.000MB ±0.000% | Entries: 1 | Errors: 1 | Retries: 1';

			const actual = reporter.toString();

			assert.equal(actual, expected);
		});
	});
});
