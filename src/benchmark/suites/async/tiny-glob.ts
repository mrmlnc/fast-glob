import * as path from 'path';

import glob = require('tiny-glob');

import * as utils from '../../utils';

const options = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_BASE_DIR as string),
	flush: true
};

const timeStart = utils.timeStart();

glob(process.env.BENCHMARK_PATTERN as string, options)
	.then((matches) => {
		const memory = utils.getMemory();
		const time = utils.timeEnd(timeStart);
		const measures = utils.getMeasures(matches.length, time, memory);

		console.info(measures);
	})
	.catch(() => {
		process.exit(0);
	});
