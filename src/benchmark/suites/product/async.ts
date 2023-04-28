import * as path from 'path';

import * as bencho from 'bencho';

import * as utils from '../../utils';

type GlobImplementation = 'fast-glob' | 'fdir' | 'node-glob';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => Promise<unknown[]>;

class Glob {
	readonly #cwd: string;
	readonly #pattern: string;

	constructor(cwd: string, pattern: string) {
		this.#cwd = cwd;
		this.#pattern = pattern;
	}

	public async measureNodeGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importNodeGlob);

		await this.#measure(() => glob.glob(this.#pattern, {
			cwd: this.#cwd,
			nodir: true,
		}));
	}

	public async measureFastGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		await this.#measure(() => glob(this.#pattern, {
			cwd: this.#cwd,
			unique: false,
			followSymbolicLinks: false,
			concurrency: Number.POSITIVE_INFINITY,
		}));
	}

	public async measureFdir(): Promise<void> {
		const { fdir: FdirBuilder } = await utils.importAndMeasure(utils.importFdir);

		const fdir = new FdirBuilder()
			.withBasePath()
			.withRelativePaths()
			// Other solutions do not include hidden files by default
			.globWithOptions([this.#pattern], { dot: false })
			.crawl(this.#cwd);

		await this.#measure(() => fdir.withPromise());
	}

	async #measure(function_: GlobImplFunction): Promise<void> {
		const timeStart = utils.timeStart();

		const matches = await function_();

		const count = matches.length;
		const memory = utils.getMemory();
		const time = utils.timeEnd(timeStart);

		bencho.time('time', time);
		bencho.memory('memory', memory);
		bencho.value('entries', count);
	}
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
	const args = process.argv.slice(2);

	const cwd = path.join(process.cwd(), args[0]);
	const pattern = args[1];
	const impl = args[2] as GlobImplementation;

	const glob = new Glob(cwd, pattern);

	switch (impl) {
		case 'node-glob': {
			await glob.measureNodeGlob();
			break;
		}

		case 'fast-glob': {
			await glob.measureFastGlob();
			break;
		}

		case 'fdir': {
			await glob.measureFdir();
			break;
		}

		default: {
			throw new TypeError('Unknown glob implementation.');
		}
	}
})();
