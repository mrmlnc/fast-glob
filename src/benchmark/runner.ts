import * as fs from 'fs';
import * as path from 'path';

import stdev = require('compute-stdev');
import execa = require('execa');

const FRACTION_DIGITS: number = 3;

interface ISuiteMeasures {
	min: number;
	max: number;
	raw: number[];
}

interface ISuiteTimes extends ISuiteMeasures {
	average: number;
	stdev: number;
}

interface ISuitePackResults {
	suite: string;
	errors: number;
	times: ISuiteTimes;
	matches: ISuiteMeasures;
	index: number;
}

type TMatches = number;
type TTime = number;
type TSuiteResults = [TTime, TMatches];

function getPaddedSuiteName(maxSuitePathLength: number, suite: string): string {
	return suite + ' '.repeat(maxSuitePathLength - suite.length);
}

function runSuiteOnce(cwd: string, suiteModulePath: string): TSuiteResults {
	const env = {
		NODE_ENV: 'production',
		BENCHMARK_CWD: cwd
	};

	const { stdout } = execa.sync('node', [suiteModulePath], { env, extendEnv: true });

	const matches = stdout.match(/(\d+(\.\d+)?)/g);

	if (!matches) {
		throw TypeError('Ops! Broken suite run.');
	}

	return [parseFloat(matches[0]), parseFloat(matches[1])];
}

function runSuitePack(cwd: string, suite: string, suiteModulePath: string, countOfRuns: number, launches: number): ISuitePackResults {
	const results: ISuitePackResults = {
		suite,
		errors: 0,
		matches: { min: 0, max: 0, raw: [] },
		times: { min: 0, max: 0, average: 0, stdev: 0, raw: [] },
		index: launches + 1
	};

	for (let i = 0; i < countOfRuns; i++) {
		try {
			const result = runSuiteOnce(cwd, suiteModulePath);

			results.matches.raw.push(result[0]);
			results.times.raw.push(result[1]);
		} catch {
			results.errors++;

			results.matches.raw.push(0);
			results.times.raw.push(0);
		}
	}

	results.matches.min = Math.min.apply(null, results.matches.raw);
	results.matches.max = Math.max.apply(null, results.matches.raw);

	results.times.min = Math.min.apply(null, results.times.raw);
	results.times.max = Math.max.apply(null, results.times.raw);

	results.times.average = results.times.raw.reduce((a, b) => a + b, 0) / countOfRuns;
	results.times.stdev = stdev(results.times.raw);

	return results;
}

export function runSuites(basedir: string, mode: 'async' | 'sync', countOfRuns: number, maxStdev: number, retries: number): void {
	const suitesPath = path.join(__dirname, 'suites', mode);
	const suites = fs.readdirSync(suitesPath).filter((suite) => suite.endsWith('.js'));

	const maxSuitePathLength = Math.max.apply(null, suites.map((suite) => suite.length));

	for (const filepath of suites) {
		const suiteName = path.basename(filepath);
		const suitePath = path.join(suitesPath, filepath);

		let result = runSuitePack(basedir, suiteName, suitePath, countOfRuns, 0);

		const paddedSuiteName = getPaddedSuiteName(maxSuitePathLength, result.suite);
		const isBrokenSuite: boolean = result.matches.min !== result.matches.max;

		while (result.times.stdev > maxStdev && result.index < retries) {
			result = runSuitePack(basedir, suiteName, suitePath, countOfRuns, result.index);
		}

		const report = [
			`${isBrokenSuite ? 'x ' : ''}SUITE ${paddedSuiteName} –`,
			`${result.times.average.toFixed(FRACTION_DIGITS)}ms \xb1${result.times.stdev.toFixed(FRACTION_DIGITS)}%`,
			`(min: ${result.times.min.toFixed(FRACTION_DIGITS)}ms) (max: ${result.times.max.toFixed(FRACTION_DIGITS)}ms)`,
			`(matches: ${result.matches.min}) (launches: ${result.index}) (err: ${result.errors})`
		].join(' ');

		console.log(report);
	}
}
