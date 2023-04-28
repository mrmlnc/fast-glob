import * as path from 'path';

import * as bencho from 'bencho';

import * as utils from '../../utils';

type GlobImplementation = 'fast-glob' | 'fdir' | 'node-glob';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => Promise<unknown[]>;

class Glob {
	constructor(private readonly _cwd: string, private readonly _pattern: string) {}

	public async measureNodeGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importNodeGlob);

		await this._measure(() => glob.glob(this._pattern, {
			cwd: this._cwd,
			nodir: true,
		}));
	}

	public async measureFastGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		await this._measure(() => glob(this._pattern, {
			cwd: this._cwd,
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
			.globWithOptions([this._pattern], { dot: false })
			.crawl(this._cwd);

		await this._measure(() => fdir.withPromise());
	}

	private async _measure(function_: GlobImplFunction): Promise<void> {
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
