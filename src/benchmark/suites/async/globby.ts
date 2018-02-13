import * as path from 'path';

import glob = require('globby');

import * as utils from '../../utils';

const options = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string),
	unique: false
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
