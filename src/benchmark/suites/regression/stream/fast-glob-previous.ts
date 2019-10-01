import * as path from 'path';

import * as fg from 'fast-glob';

import * as utils from '../../../utils';

const options: fg.Options = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_BASE_DIR as string),
	unique: false,
	...JSON.parse(process.env.BENCHMARK_OPTIONS as string)
};

const entries: string[] = [];

const timeStart = utils.timeStart();

const stream = fg.stream(process.env.BENCHMARK_PATTERN as string, options);

stream.once('error', () => process.exit(0));
stream.on('data', (entry: string) => entries.push(entry));
stream.once('end', () => {
	const memory = utils.getMemory();
	const time = utils.timeEnd(timeStart);
	const measures = utils.formatMeasures([...entries].length, time, memory);

	console.info(measures);
});
