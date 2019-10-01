import * as assert from 'assert';

import * as utils from './utils';

describe('Benchmark → Utils', () => {
	const oldProcessHrtime = process.hrtime;
	const oldProcessMemoryUsage = process.memoryUsage;

	before(() => {
		process.env.FG_TEST_ENV_INTEGER = '1';
		process.env.FG_TEST_ENV_OBJECT = '{ "value": true }';

		process.hrtime = (() => [0, 1e7]) as NodeJS.HRTime;
		process.memoryUsage = () => ({ external: 0, rss: 0, heapTotal: 0, heapUsed: 10 * 1e6 });
	});

	after(() => {
		delete process.env.FG_TEST_ENV_INTEGER;
		delete process.env.FG_TEST_ENV_OBJECT;

		process.hrtime = oldProcessHrtime;
		process.memoryUsage = oldProcessMemoryUsage;
	});

	describe('.convertHrtimeToMilliseconds', () => {
		it('should return milliseconds', () => {
			const hrtime: [number, number] = [0, 1e7];

			const expected = 10;

			const actual = utils.convertHrtimeToMilliseconds(hrtime);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.convertBytesToMegaBytes', () => {
		it('should return megabytes', () => {
			const expected = 1;

			const actual = utils.convertBytesToMegaBytes(1e6);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.timeStart', () => {
		it('should return hrtime', () => {
			const expected: [number, number] = [0, 1e7];

			const actual = utils.timeStart();

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.timeEnd', () => {
		it('should return diff between hrtime\'s', () => {
			const expected = 10;

			const actual = utils.timeEnd([0, 1e7]);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getMemory', () => {
		it('should return memory usage in megabytes', () => {
			const expected = 10;

			const actual = utils.getMemory();

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getMeasures', () => {
		it('should return measures', () => {
			const expected = '{"matches":1,"time":1,"memory":1}';

			const actual = utils.formatMeasures(1, 1, 1);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getAverageValue', () => {
		it('should return average value for array', () => {
			const expected = 2;

			const actual = utils.getAverageValue([3, 1, 2]);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getStdev', () => {
		it('should return stdev for array', () => {
			const expected = 1;

			const actual = utils.getStdev([1, 2, 3]);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getEnvAsInteger', () => {
		it('should return integer', () => {
			const expected = 1;

			const actual = utils.getEnvAsInteger('FG_TEST_ENV_INTEGER');

			assert.strictEqual(actual, expected);
		});

		it('should return undefined', () => {
			const expected = undefined;

			const actual = utils.getEnvAsInteger('NON_EXIST_ENV_VARIABLE');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getEnvAsObject', () => {
		it('should return object', () => {
			const expected = { value: true };

			const actual = utils.getEnvAsObject('FG_TEST_ENV_OBJECT');

			assert.deepStrictEqual(actual, expected);
		});

		it('should return undefined', () => {
			const expected = undefined;

			const actual = utils.getEnvAsObject('NON_EXIST_ENV_VARIABLE');

			assert.strictEqual(actual, expected);
		});
	});
});
