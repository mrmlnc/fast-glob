import minimist = require('minimist');
import rimraf = require('rimraf');

import * as fixtures from './fixtures';
import * as logger from './logger';
import Runner, { IRunnerOptions } from './runner';

interface IArgv extends IRunnerOptions {
	basedir: string;
}

const argv = minimist<IArgv>(process.argv.slice(2), {
	default: {
		basedir: '.benchmark',
		type: 'async',
		depth: 1,
		launches: 10,
		maxStdev: 3,
		retries: 5
	} as IArgv
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
