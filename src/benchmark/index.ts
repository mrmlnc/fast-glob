import minimist = require('minimist');

import * as logger from './logger';
import Runner, { RunnerOptions } from './runner';
import * as utils from './utils';

interface Arguments extends RunnerOptions {
	basedir: string;
}

const defaultArgv: Arguments = {
	basedir: '.',
	type: 'async',
	pattern: process.env.BENCHMARK_PATTERN || '*',
	launches: utils.getEnvAsInteger('BENCHMARK_LAUNCHES') || 10,
	maxStdev: utils.getEnvAsInteger('BENCHMARK_MAX_STDEV') || 3,
	retries: utils.getEnvAsInteger('BENCHMARK_RETRIES') || 5
};

const argv = minimist<Arguments>(process.argv.slice(2), {
	default: defaultArgv
});

const runner = new Runner(argv.basedir, argv);

logger.head(`Benchmark pattern (${argv.pattern}) with ${argv.launches} launches (${argv.type})`);
logger.newline();
runner.packs();
