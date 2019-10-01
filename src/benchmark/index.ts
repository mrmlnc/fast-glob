import * as logger from './logger';
import Runner, { RunnerOptions } from './runner';
import * as utils from './utils';

import minimist = require('minimist');

const PROCESS_FIRST_ARGUMENT_INDEX = 2;
const DEFAULT_BENCHMARK_LAUNCHES = 10;
const DEFAULT_BENCHMARK_MAX_STDEV = 3;
const DEFAULT_BENCHMARK_RETRIES = 5;

type Arguments = {
	basedir: string;
} & RunnerOptions;

const defaultArgv: Arguments = {
	basedir: '.',
	type: utils.getEnvironmentAsString('BENCHMARK_TYPE', 'product'),
	mode: utils.getEnvironmentAsString('BENCHMARK_MODE', 'async'),
	pattern: utils.getEnvironmentAsString('BENCHMARK_PATTERN', '*'),
	launches: utils.getEnvironmentAsInteger('BENCHMARK_LAUNCHES', DEFAULT_BENCHMARK_LAUNCHES),
	maxStdev: utils.getEnvironmentAsInteger('BENCHMARK_MAX_STDEV', DEFAULT_BENCHMARK_MAX_STDEV),
	retries: utils.getEnvironmentAsInteger('BENCHMARK_RETRIES', DEFAULT_BENCHMARK_RETRIES),
	options: utils.getEnvironmentAsObject('BENCHMARK_OPTIONS', {})
};

const argv = minimist<Arguments>(process.argv.slice(PROCESS_FIRST_ARGUMENT_INDEX), {
	default: defaultArgv
});

const runner = new Runner(argv.basedir, argv);

logger.head(`Benchmark pattern "${argv.pattern}" with ${argv.launches} launches (${argv.type}, ${argv.mode})`);
logger.head(`Max stdev: ${argv.maxStdev} | Retries: ${argv.retries} | Options: ${JSON.stringify(argv.options)}`);
logger.newline();
runner.packs();
