import * as fs from 'fs';
import * as path from 'path';

import execa = require('execa');

import Reporter from './reporter';
import * as utils from './utils';

export interface RunnerOptions {
	type: 'sync' | 'async';
	pattern: string;
	launches: number;
	maxStdev: number;
	retries: number;
}

export interface SuiteMeasures {
	matches: number;
	time: number;
	memory: number;
}

export interface Measure {
	units: string;
	raw: number[];
	average: number;
	stdev: number;
}

export interface SuitePackMeasures extends Record<string, Measure> {
	time: Measure;
	memory: Measure;
}

export interface SuitePackResult {
	name: string;
	errors: number;
	entries: number;
	retries: number;
	measures: SuitePackMeasures;
}

export default class Runner {
	constructor(private readonly _basedir: string, private readonly _options: RunnerOptions) { }

	public execNodeProcess(args: string[], options: Partial<execa.SyncOptions>): string {
		return execa.sync('node', args, options).stdout;
	}

	/**
	 * Runs a single suite in the child process and returns the measurements of his work.
	 */
	public suite(suitePath: string): SuiteMeasures {
		const env: NodeJS.ProcessEnv = {
			NODE_ENV: 'production',
			BENCHMARK_BASE_DIR: this._basedir,
			BENCHMARK_PATTERN: this._options.pattern
		};

		const stdout = this.execNodeProcess([suitePath], { env, extendEnv: true });

		try {
			return JSON.parse(stdout) as SuiteMeasures;
		} catch {
			throw new TypeError('Ops! Broken suite run.');
		}
	}

	public suitePack(suitePath: string, retries: number): SuitePackResult {
		const results: SuitePackResult = {
			name: path.basename(suitePath),
			errors: 0,
			entries: 0,
			retries: retries + 1,
			measures: this._getSuitePackMeasures()
		};

		for (let i = 0; i < this._options.launches; i++) {
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
			time: this._getMeasures(results.measures.time.raw, 'ms'),
			memory: this._getMeasures(results.measures.memory.raw, 'MB')
		};

		return results;
	}

	public report(result: SuitePackResult): void {
		const reporter = new Reporter(result);

		const report = reporter.toString();

		console.log(report);
	}

	public packs(): void {
		const suitesPath = path.join(__dirname, 'suites', this._options.type);
		const suites = this.getSuites(suitesPath);

		for (const filepath of suites) {
			const suitePath = path.join(suitesPath, filepath);

			let result = this.suitePack(suitePath, 0);

			while (result.measures.time.stdev > this._options.maxStdev && result.retries < this._options.retries) {
				result = this.suitePack(suitePath, result.retries);
			}

			this.report(result);
		}
	}

	public getSuites(suitesPath: string): string[] {
		return fs.readdirSync(suitesPath).filter((suite) => suite.endsWith('.js'));
	}

	private _getMeasures(raw: number[], units: string): Measure {
		return {
			units,
			raw,
			average: utils.getAverageValue(raw),
			stdev: utils.getStdev(raw)
		};
	}

	private _getSuitePackMeasures(): SuitePackMeasures {
		return {
			time: this._getMeasures([], 'ms'),
			memory: this._getMeasures([], 'MB')
		};
	}
}
