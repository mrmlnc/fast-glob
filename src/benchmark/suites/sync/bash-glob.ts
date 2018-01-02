import * as path from 'path';

import glob = require('bash-glob');
import micromatch = require('micromatch');

import * as utils from '../../utils';

import { TPattern } from '../../../types/patterns';

const patterns: TPattern[] = ['**/*.md', '**/*.txt', '!**/*.txt'];

const options: glob.Options = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string),
	globstar: true
};

const timeStart = utils.timeStart();

try {
	const matches = glob.sync(['**/*', '**/*.md', '**/*.txt', '!**/*.txt'], options);
	const memory = utils.getMemory();

	// The bash-glob package does not support negative patterns
	const entries = micromatch(matches, patterns);

	const time = utils.timeEnd(timeStart);
	const measures = utils.getMeasures(entries.length, time, memory);

	console.info(measures);
} catch {
	process.exit(0);
}
