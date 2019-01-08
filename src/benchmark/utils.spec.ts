import * as assert from 'assert';

import * as utils from './utils';

describe('Benchmark → Utils', () => {
	const oldProcessHrtime = process.hrtime;
	const oldProcessMemoryUsage = process.memoryUsage;

	before(() => {
		process.env.FG_TEST_ENV_INTEGER = '1';

		process.hrtime = () => [0, 1e7];
		process.memoryUsage = () => ({ external: 0, rss: 0, heapTotal: 0, heapUsed: 10 * 1024 * 1024 });
	});

	after(() => {
		delete process.env.FG_TEST_ENV_INTEGER;

		process.hrtime = oldProcessHrtime;
		process.memoryUsage = oldProcessMemoryUsage;
	});

	describe('.convertHrtimeToMilliseconds', () => {
		it('should returns milliseconds', () => {
			const hrtime: [number, number] = [0, 1e7];

			const expected = 10;

			const actual = utils.convertHrtimeToMilliseconds(hrtime);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.convertBytesToMegaBytes', () => {
		it('should returns megabytes', () => {
			const expected = 1;

			const actual = utils.convertBytesToMegaBytes(1e6);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.timeStart', () => {
		it('should returns hrtime', () => {
			const expected: [number, number] = [0, 1e7];

			const actual = utils.timeStart();

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.timeEnd', () => {
		it('should returns diff between hrtime\'s', () => {
			const expected = 10;

			const actual = utils.timeEnd([0, 1e7]);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getMemory', () => {
		it('should returns memory usage in megabytes', () => {
			const expected = 10;

			const actual = utils.getMemory();

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getMeasures', () => {
		it('should returns measures', () => {
			const expected = '{"matches":1,"time":1,"memory":1}';

			const actual = utils.getMeasures(1, 1, 1);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getAverageValue', () => {
		it('should returns average value for array', () => {
			const expected = 2;

			const actual = utils.getAverageValue([3, 1, 2]);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getStdev', () => {
		it('should returns stdev for array', () => {
			const expected = 1;

			const actual = utils.getStdev([1, 2, 3]);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getEnvAsInteger', () => {
		it('should returns integer', () => {
			const expected = 1;

			const actual = utils.getEnvAsInteger('FG_TEST_ENV_INTEGER');

			assert.strictEqual(actual, expected);
		});

		it('should returns undefined', () => {
			const expected: undefined = undefined;

			const actual = utils.getEnvAsInteger('NON_EXIST_ENV_VARIABLE');

			assert.strictEqual(actual, expected);
		});
	});
});
