import minimist = require('minimist');
import rimraf = require('rimraf');

import * as fixtures from './fixtures';
import * as logger from './logger';
import * as runner from './runner';

const argv = minimist(process.argv.slice(2));

const BASE_BENCHMARK_PATH: string = '.benchmark';
const LEVEL: number = argv.level || 50;
const RUNS: number = argv.runs || 100;
const MAX_STDEV: number = argv.stdev || 5;
const MAX_RETRIES: number = argv.retries || 5;
const ASYNC_MODE: number = argv.sync || true;
const SYNC_MODE: number = argv.sync || false;

logger.head('Remove olded fixtures');
rimraf.sync(BASE_BENCHMARK_PATH);
logger.newline();

logger.head('Create fixtures');
fixtures.makeFixtures(BASE_BENCHMARK_PATH, LEVEL);
logger.newline();

if (ASYNC_MODE) {
	logger.head(`Benchmark for ${LEVEL} levels (runs: ${RUNS}) (async)`);
	runner.runSuites(BASE_BENCHMARK_PATH, 'async', RUNS, MAX_STDEV, MAX_RETRIES);
	logger.newline();
}

if (SYNC_MODE) {
	logger.head(`Benchmark for ${LEVEL} levels (runs: ${RUNS}) (sync)`);
	runner.runSuites(BASE_BENCHMARK_PATH, 'sync', RUNS, MAX_STDEV, MAX_RETRIES);
	logger.newline();
}

logger.head('Remove fixtures');
rimraf.sync(BASE_BENCHMARK_PATH);
