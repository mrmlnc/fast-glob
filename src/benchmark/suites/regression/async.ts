import * as path from 'path';

import * as bencho from 'bencho';

import * as utils from '../../utils';

import type * as fastGlobCurrent from '../../..';


type GlobImplementation = 'previous' | 'current';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => Promise<unknown[]>;

class Glob {
	private readonly _options: fastGlobCurrent.Options;

	constructor(private readonly _pattern: string, options: fastGlobCurrent.Options) {
		this._options = {
			unique: false,
			followSymbolicLinks: false,
			concurrency: Number.POSITIVE_INFINITY,
			...options,
		};
	}

	public async measurePreviousVersion(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importPreviousFastGlob);

		// @ts-expect-error remove this line after the next major release.
		await this._measure(() => glob(this._pattern, this._options));
	}

	public async measureCurrentVersion(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		await this._measure(() => glob(this._pattern, this._options));
	}

	private async _measure(func: GlobImplFunction): Promise<void> {
		const timeStart = utils.timeStart();

		const matches = await func();

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
	const options = JSON.parse(process.env.BENCHMARK_OPTIONS ?? '{}');

	const glob = new Glob(pattern, {
		cwd,
		...options,
	});

	switch (impl) {
		case 'current': {
			await glob.measureCurrentVersion();
			break;
		}

		case 'previous': {
			await glob.measurePreviousVersion();
			break;
		}

		default: {
			throw new TypeError(`Unknown glob implementation: ${impl}`);
		}
	}
})();
