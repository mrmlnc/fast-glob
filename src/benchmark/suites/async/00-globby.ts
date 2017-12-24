import * as path from 'path';

import * as globby from 'globby';

import { IOptions } from 'glob';

const options: IOptions = {
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string),
	nosort: true,
	nounique: true,
	nodir: true
};

console.time('timer');

globby(['**/*', '**/*.md', '**/*.txt', '!**/*.txt'], options)
	.then((matches) => {
		console.info('files: ' + matches.length);
		console.timeEnd('timer');
	})
	.catch((err) => {
		console.error(err);
		process.exit(0);
	});
