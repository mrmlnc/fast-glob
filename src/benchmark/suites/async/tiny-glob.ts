import * as path from 'path';

import micromatch = require('micromatch');
import glob = require('tiny-glob');

import * as utils from '../../utils';

import { Pattern } from '../../../types/index';

const options = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string),
	flush: true
};

const patterns: Pattern[] = ['**/*.md', '!**/*.txt'];

const timeStart = utils.timeStart();

glob('**/*', options)
	.then((matches) => {
		const memory = utils.getMemory();

		// The tiny-glob package does not support negative patterns
		const entries = micromatch(matches, patterns);

		const time = utils.timeEnd(timeStart);
		const measures = utils.getMeasures(entries.length, time, memory);

		console.info(measures);
	})
	.catch(() => {
		process.exit(0);
	});
