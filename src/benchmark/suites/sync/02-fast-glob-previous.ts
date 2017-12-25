import * as path from 'path';

import { IOptions, sync } from 'fast-glob';

const options: IOptions = {
	bashNative: [],
	onlyFiles: true,
	cwd: path.join(process.cwd(), process.env.BENCHMARK_CWD as string)
};

console.time('timer');

try {
	const matches = sync(['**/*', '**/*.md', '**/*.txt', '!**/*.txt'], options);

	console.info('files: ' + matches.length);
	console.timeEnd('timer');
} catch (err) {
	console.error(err);
	process.exit(0);
}
