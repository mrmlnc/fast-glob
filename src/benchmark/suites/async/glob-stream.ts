import * as path from 'path';

import glob = require('glob-stream');

import * as utils from '../../utils';

import { IOptions } from 'glob';

const options: IOptions = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string),
	nosort: true,
	nounique: true,
	nodir: true
};

const timeStart = utils.timeStart();

const entries: string[] = [];

const stream = glob(['**/*', '!**/*.txt'], options);

stream.on('data', (data: glob.Entry) => entries.push(data.path));
stream.on('error', () => process.exit(0));
stream.once('end', () => {
	const memory = utils.getMemory();
	const time = utils.timeEnd(timeStart);
	const measures = utils.getMeasures(entries.length, time, memory);

	console.info(measures);
});
