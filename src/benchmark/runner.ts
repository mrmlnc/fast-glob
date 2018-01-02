import * as fs from 'fs';
import * as path from 'path';

import execa = require('execa');

import Reporter from './reporter';
import * as utils from './utils';

export interface IRunnerOptions {
	/**
	 * The directory from which you want to take suites.
	 */
	type: 'sync' | 'async';
	/**
	 * The number of nested directories.
	 */
	depth: number;
	/**
	 * The number of runs for each suite.
	 */
	launches: number;
	/**
	 * The maximum allowable deviation in percent.
	 */
	maxStdev: number;
	/**
	 * The number of retries before giving the result, if the current deviation is greater than specified in `maxStdev`.
	 */
	retries: number;
}

export interface ISuiteMeasures {
	matches: number;
	time: number;
	memory: number;
}

export interface IMeasure {
	units: string;
	raw: number[];
	average: number;
	stdev: number;
}

export interface ISuitePackMeasures extends Record<string, IMeasure> {
	time: IMeasure;
	memory: IMeasure;
}

export interface ISuitePackResult {
	name: string;
	errors: number;
	entries: number;
	retries: number;
	measures: ISuitePackMeasures;
}

export default class Runner {
	constructor(private readonly basedir: string, private readonly options: IRunnerOptions) { }

	/**
	 * Runs child process.
	 */
	public execNodeProcess(args: string[], options: Partial<execa.SyncOptions>): string {
		return execa.sync('node', args, options).stdout;
	}

	/**
	 * Runs a single suite in the child process and returns the measurements of his work.
	 */
	public suite(suitePath: string): ISuiteMeasures {
		const env: Record<string, string> = {
			NODE_ENV: 'production',
			BENCHMARK_CWD: this.basedir
		};

		const stdout = this.execNodeProcess([suitePath], { env, extendEnv: true });

		try {
			return JSON.parse(stdout) as ISuiteMeasures;
		} catch {
			throw new TypeError('Ops! Broken suite run.');
		}
	}

	/**
	 * Runs a pack of suites.
	 */
	public suitePack(suitePath: string, retries: number): ISuitePackResult {
		const results: ISuitePackResult = {
			name: path.basename(suitePath),
			errors: 0,
			entries: 0,
			retries: retries + 1,
			measures: this.getSuitePackMeasures()
		};

		for (let i = 0; i < this.options.launches; i++) {
			try {
				const { matches, time, memory } = this.suite(suitePath);

				results.entries = matches;

				results.measures.time.raw.push(time);
				results.measures.memory.raw.push(memory);
			} catch {
				results.errors++;

				results.measures.time.raw.push(0);
				results.measures.memory.raw.push(0);
			}
		}

		results.measures = {
			time: this.getMeasures(results.measures.time.raw, 'ms'),
			memory: this.getMeasures(results.measures.memory.raw, 'MB')
		};

		return results;
	}

	public report(result: ISuitePackResult): void {
		const reporter = new Reporter(result);

		const report = reporter.toString();

		console.log(report);
	}

	public packs(): void {
		const suitesPath: string = path.join(__dirname, 'suites', this.options.type);
		const suites: string[] = this.getSuites(suitesPath);

		for (const filepath of suites) {
			const suitePath: string = path.join(suitesPath, filepath);

			let result = this.suitePack(suitePath, 0);

			while (result.measures.time.stdev > this.options.maxStdev && result.retries < this.options.retries) {
				result = this.suitePack(suitePath, result.retries);
			}

			this.report(result);
		}
	}

	public getSuites(suitesPath: string): string[] {
		return fs.readdirSync(suitesPath).filter((suite) => suite.endsWith('.js'));
	}

	private getMeasures(raw: number[], units: string): IMeasure {
		return {
			units,
			raw,
			average: utils.getAverageValue(raw),
			stdev: utils.getStdev(raw)
		};
	}

	private getSuitePackMeasures(): ISuitePackMeasures {
		return {
			time: this.getMeasures([], 'ms'),
			memory: this.getMeasures([], 'MB')
		};
	}
}
