import * as path from 'path';

import * as utils from '../../../utils';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import glob = require('tiny-glob/sync');

const options = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_BASE_DIR as string),
	flush: true
};

const timeStart = utils.timeStart();

try {
	const matches = glob(process.env.BENCHMARK_PATTERN as string, options);
	const memory = utils.getMemory();
	const time = utils.timeEnd(timeStart);
	const measures = utils.formatMeasures(matches.length, time, memory);

	console.info(measures);
} catch {
	process.exit(0);
}
