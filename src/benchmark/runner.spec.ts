import * as assert from 'assert';

import Runner, { RunnerOptions, SuiteMeasures, SuitePackResult } from './runner';

class RunnerFakeProcess extends Runner {
	public execNodeProcess(): string {
		return '{"matches":1,"time":1,"memory":1}';
	}
}

class RunnerFakeProcessError extends Runner {
	public execNodeProcess(): string {
		return 'error';
	}
}

class RunnerFakeReport extends RunnerFakeProcess {
	public results: SuitePackResult[] = [];

	public report(results: SuitePackResult): void {
		this.results.push(results);
	}

	public getSuites(): string[] {
		return ['suite.js'];
	}
}

describe('Benchmark → Runner', () => {
	const runnerOptions: RunnerOptions = {
		type: 'product',
		mode: 'async',
		pattern: '*',
		launches: 3,
		maxStdev: 3,
		retries: 5,
		options: {}
	};

	describe('.suite', () => {
		it('should returns measures', () => {
			const runner = new RunnerFakeProcess('basedir', runnerOptions);

			const expected: SuiteMeasures = {
				matches: 1,
				time: 1,
				memory: 1
			};

			const actual = runner.suite('suitePath');

			assert.deepStrictEqual(actual, expected);
		});

		it('should throw error', () => {
			const runner = new RunnerFakeProcessError('basedir', runnerOptions);

			assert.throws(() => runner.suite('suitePath'), /Ops! Broken suite run\./);
		});
	});

	describe('.suitePack', () => {
		it('should returns pack measures', () => {
			const runner = new RunnerFakeProcess('basedir', runnerOptions);

			const expected: SuitePackResult = {
				name: 'suitePath',
				errors: 0,
				retries: 1,
				entries: 1,
				measures: {
					time: { raw: [1, 1, 1], average: 1, stdev: 0, units: 'ms' },
					memory: { raw: [1, 1, 1], average: 1, stdev: 0, units: 'MB' }
				}
			};

			const actual = runner.suitePack('suitePath', 0);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns pack measures with errors', () => {
			const runner = new RunnerFakeProcessError('basedir', runnerOptions);

			const expected: SuitePackResult = {
				name: 'suitePath',
				errors: 3,
				retries: 1,
				entries: 0,
				measures: {
					time: { raw: [0, 0, 0], average: 0, stdev: 0, units: 'ms' },
					memory: { raw: [0, 0, 0], average: 0, stdev: 0, units: 'MB' }
				}
			};

			const actual = runner.suitePack('suitePath', 0);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.packs', () => {
		it('should run pack of suites', () => {
			const runner = new RunnerFakeReport('basedir', runnerOptions);

			const expected = [{
				name: 'suite.js',
				errors: 0,
				entries: 1,
				retries: 1,
				measures: {
					time: { raw: [1, 1, 1], average: 1, stdev: 0, units: 'ms' },
					memory: { raw: [1, 1, 1], average: 1, stdev: 0, units: 'MB' }
				}
			}];

			runner.packs();

			assert.deepStrictEqual(runner.results, expected);
		});
	});
});
