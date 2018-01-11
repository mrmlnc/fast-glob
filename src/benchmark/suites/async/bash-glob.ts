import * as path from 'path';

import glob = require('bash-glob');
import micromatch = require('micromatch');

import * as utils from '../../utils';

import { Pattern } from '../../../types/patterns';

const patterns: Pattern[] = ['**/*.md', '**/*.txt', '!**/*.txt'];

const options: glob.Options = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string),
	globstar: true
};

const timeStart = utils.timeStart();

glob(['**/*', '**/*.md', '**/*.txt', '!**/*.txt'], options, (err, matches) => {
	const memory = utils.getMemory();

	if (err) {
		process.exit(0);
	}

	// The bash-glob package does not support negative patterns
	const entries = micromatch(matches, patterns);

	const time = utils.timeEnd(timeStart);
	const measures = utils.getMeasures(entries.length, time, memory);

	console.info(measures);
});
