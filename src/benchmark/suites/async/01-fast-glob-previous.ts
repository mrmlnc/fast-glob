import * as path from 'path';

import glob, { IOptions } from 'fast-glob';

const options: IOptions = {
	bashNative: [],
	onlyFiles: true,
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string)
};

console.time('timer');

glob(['**/*', '**/*.md', '**/*.txt', '!**/*.txt'], options)
	.then((matches) => {
		console.info('files: ' + matches.length);
		console.timeEnd('timer');
	})
	.catch((err) => {
		console.error(err);
		process.exit(0);
	});
