import minimist = require('minimist');
import rimraf = require('rimraf');

import * as fixtures from './fixtures';
import * as logger from './logger';
import Runner, { RunnerOptions } from './runner';
import * as utils from './utils';

interface Arguments extends RunnerOptions {
	basedir: string;
}

const defaultArgv: Arguments = {
	basedir: '.benchmark',
	type: 'async',
	depth: utils.getEnvAsInteger('BENCHMARK_DEPTH') || 1,
	launches: utils.getEnvAsInteger('BENCHMARK_LAUNCHES') || 10,
	maxStdev: utils.getEnvAsInteger('BENCHMARK_MAX_STDEV') || 3,
	retries: utils.getEnvAsInteger('BENCHMARK_RETRIES') || 5
};

const argv = minimist<Arguments>(process.argv.slice(2), {
	default: defaultArgv
});

const runner = new Runner(argv.basedir, argv);

logger.head('Remove olded fixtures');
rimraf.sync(argv.basedir);
logger.newline();

logger.head('Create fixtures');
fixtures.makeFixtures(argv.basedir, argv.depth);
logger.newline();

logger.head(`Benchmark for ${argv.depth} depth and ${argv.launches} launches (${argv.type})`);
logger.newline();
runner.packs();

logger.head('Remove fixtures');
rimraf.sync(argv.basedir);
