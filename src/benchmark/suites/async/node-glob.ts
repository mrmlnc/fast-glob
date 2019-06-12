import * as path from 'path';

import glob = require('glob');

import * as utils from '../../utils';

const options: glob.IOptions = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_BASE_DIR as string),
	nosort: true,
	nounique: true,
	nodir: true
};

const timeStart = utils.timeStart();

glob(process.env.BENCHMARK_PATTERN as string, options, (error, matches) => {
	if (error) {
		process.exit(0);
	}

	const memory = utils.getMemory();
	const time = utils.timeEnd(timeStart);
	const measures = utils.getMeasures(matches.length, time, memory);

	console.info(measures);
});
