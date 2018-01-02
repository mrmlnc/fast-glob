import * as path from 'path';

import { IOptions, sync } from 'fast-glob';

import * as utils from '../../utils';

const options: IOptions = {
	bashNative: [],
	onlyFiles: true,
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string)
};

const timeStart = utils.timeStart();

try {
	const matches = sync(['**/*', '**/*.md', '**/*.txt', '!**/*.txt'], options);
	const memory = utils.getMemory();
	const time = utils.timeEnd(timeStart);
	const measures = utils.getMeasures(matches.length, time, memory);

	console.info(measures);
} catch {
	process.exit(0);
}
