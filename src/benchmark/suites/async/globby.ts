import * as path from 'path';

import glob = require('globby');

import * as utils from '../../utils';

import { IOptions } from 'glob';

const options: IOptions = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string),
	nosort: true,
	nounique: true,
	nodir: true
};

const timeStart = utils.timeStart();

glob(['**/*', '**/*.md', '**/*.txt', '!**/*.txt'], options)
	.then((matches) => {
		const memory = utils.getMemory();
		const time = utils.timeEnd(timeStart);
		const measures = utils.getMeasures(matches.length, time, memory);

		console.info(measures);
	})
	.catch(() => process.exit(0));
