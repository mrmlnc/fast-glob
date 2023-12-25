import * as path from 'node:path';

import * as bencho from 'bencho';

import * as utils from '../../utils';

import type * as fastGlobCurrent from '../../..';

type GlobImplementation = 'current' | 'previous';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => ReturnType<typeof fastGlobCurrent.stream>;
type GlobOptions = fastGlobCurrent.Options;

class Glob {
	readonly #pattern: string;
	readonly #options: GlobOptions;

	constructor(pattern: string, options: GlobOptions) {
		this.#pattern = pattern;
		this.#options = {
			unique: false,
			followSymbolicLinks: false,
			...options,
		};
	}

	public async measurePreviousVersion(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importPreviousFastGlob);

		// @ts-expect-error remove this line after the next major release.
		await this.#measure(() => glob.globStream(this.#pattern, this.#options));
	}

	public async measureCurrentVersion(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		await this.#measure(() => glob.globStream(this.#pattern, this.#options));
	}

	async #measure(function_: GlobImplFunction): Promise<void> {
		const entries: string[] = [];

		const timeStart = utils.timeStart();

		await new Promise<void>((resolve, reject) => {
			const stream = function_();

			stream.once('error', (error) => {
				reject(error);
			});
			stream.on('data', (entry: string) => entries.push(entry));
			stream.once('end', () => {
				resolve();
			});
		});

		const count = entries.length;
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
	const options = JSON.parse(process.env['BENCHMARK_OPTIONS'] ?? '{}') as GlobOptions;

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
			throw new TypeError('Unknown glob implementation.');
		}
	}
})();
