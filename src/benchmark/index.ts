import * as minimist from 'minimist';
import * as rimraf from 'rimraf';

import * as fixtures from './fixtures';
import * as logger from './logger';
import * as runner from './runner';

const argv = minimist(process.argv.slice(2));

const BASE_BENCHMARK_PATH: string = '.benchmark';
const LEVEL: number = argv.level || 50;
const RUNS: number = argv.runs || 100;
const MAX_STDEV: number = argv.stdev || 5;
const MAX_RETRIES: number = argv.retries || 5;

logger.head('Remove olded fixtures');
rimraf.sync(BASE_BENCHMARK_PATH);
logger.newline();

logger.head('Create fixtures');
fixtures.makeFixtures(BASE_BENCHMARK_PATH, LEVEL);
logger.newline();

logger.head(`Benchmark (runs: ${RUNS}) (async)`);
runner.runSuites(BASE_BENCHMARK_PATH, 'async', RUNS, MAX_STDEV, MAX_RETRIES);
logger.newline();

logger.head(`Benchmark (runs: ${RUNS}) (sync)`);
runner.runSuites(BASE_BENCHMARK_PATH, 'sync', RUNS, MAX_STDEV, MAX_RETRIES);
logger.newline();

logger.head('Remove fixtures');
rimraf.sync(BASE_BENCHMARK_PATH);
