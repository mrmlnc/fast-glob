import * as path from 'path';

import * as glob from '../../../../index';
import * as utils from '../../../utils';

const options: glob.Options = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_BASE_DIR as string),
	unique: false,
	...JSON.parse(process.env.BENCHMARK_OPTIONS as string)
};

const entries: string[] = [];

const timeStart = utils.timeStart();

const stream = glob.stream(process.env.BENCHMARK_PATTERN as string, options);

stream.once('error', () => process.exit(0));
stream.on('data', (entry: string) => entries.push(entry));
stream.once('end', () => {
	const memory = utils.getMemory();
	const time = utils.timeEnd(timeStart);
	const measures = utils.getMeasures([...entries].length, time, memory);

	console.info(measures);
});
