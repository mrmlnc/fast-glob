import * as path from 'path';

import globby = require('globby');

import { IOptions } from 'glob';

const options: IOptions = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string),
	nosort: true,
	nounique: true,
	nodir: true
};

console.time('timer');

try {
	const matches = globby.sync(['**/*', '**/*.md', '**/*.txt', '!**/*.txt'], options);

	console.info('files: ' + matches.length);
	console.timeEnd('timer');
} catch (err) {
	console.error(err);
	process.exit(0);
}
