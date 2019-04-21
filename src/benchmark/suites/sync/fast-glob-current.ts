import * as path from 'path';

import * as glob from '../../../index';
import Settings from '../../../settings';
import * as utils from '../../utils';

const settings = new Settings({
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string),
	unique: false
});

const timeStart = utils.timeStart();

try {
	const matches = glob.sync(['**/*', '!**/*.txt'], settings);
	const memory = utils.getMemory();
	const time = utils.timeEnd(timeStart);
	const measures = utils.getMeasures(matches.length, time, memory);

	console.info(measures);
} catch {
	process.exit(0);
}
