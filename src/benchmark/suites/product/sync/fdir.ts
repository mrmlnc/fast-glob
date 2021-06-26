import * as path from 'path';

import { fdir as GlobBuilder, PathsOutput } from 'fdir';

import * as utils from '../../../utils';

const CWD = path.join(process.cwd(), process.env.BENCHMARK_BASE_DIR as string);
const PATTERN = process.env.BENCHMARK_PATTERN as string;

const glob = new GlobBuilder()
	.glob(PATTERN)
	.crawl(CWD);

const timeStart = utils.timeStart();

try {
	const matches = glob.sync() as PathsOutput;
	const memory = utils.getMemory();
	const time = utils.timeEnd(timeStart);
	const measures = utils.formatMeasures(matches.length, time, memory);

	console.info(measures);
} catch {
	process.exit(0);
}
