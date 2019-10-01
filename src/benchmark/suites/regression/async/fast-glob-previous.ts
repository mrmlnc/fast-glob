import * as path from 'path';

import * as fg from 'fast-glob';

import * as utils from '../../../utils';

const options: fg.Options = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_BASE_DIR as string),
	unique: false,
	...JSON.parse(process.env.BENCHMARK_OPTIONS as string)
};

const timeStart = utils.timeStart();

fg(process.env.BENCHMARK_PATTERN as string, options)
	.then((matches) => {
		const memory = utils.getMemory();
		const time = utils.timeEnd(timeStart);
		const measures = utils.formatMeasures(matches.length, time, memory);

		console.info(measures);
	})
	.catch(() => {
		process.exit(0);
	});
