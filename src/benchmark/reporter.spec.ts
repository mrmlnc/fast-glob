import * as assert from 'assert';

import Reporter from './reporter';
import { SuitePackResult } from './runner';

describe('Benchmark → Reporter', () => {
	const result: SuitePackResult = {
		name: 'name',
		errors: 0,
		retries: 1,
		entries: 1,
		measures: {
			time: { raw: [1, 1, 1], average: 1, stdev: 0, units: 'ms' },
			memory: { raw: [1, 1, 1], average: 1, stdev: 0, units: 'MB' }
		}
	};

	describe('.format', () => {
		it('should returns report', () => {
			const reporter = new Reporter();

			reporter.row(result);

			const expected = [
				'Name  Time, ms  Time stdev, %  Memory, MB  Memory stdev, %  Entries  Errors  Retries',
				'----  --------  -------------  ----------  ---------------  -------  ------  -------',
				'name  1.000     0.000          1.000       0.000            1        0       1      ',
				''
			].join('\n');

			const actual = reporter.format();

			assert.strictEqual(actual, expected);
		});
	});
});
