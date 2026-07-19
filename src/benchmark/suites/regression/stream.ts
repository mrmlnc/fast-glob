import * as path from 'node:path';
import * as process from 'node:process';
import * as bencho from 'bencho';
import * as utils from '../../utils';
import type * as fastGlobCurrent from '../../..';

type GlobImplementation = 'current' | 'previous';

type GlobImplFunction = (...args: any[]) => ReturnType<typeof fastGlobCurrent.globStream>;
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

	async #measure(function_: GlobImplFunction): Promise<void> {
		const entries: string[] = [];

		const timeStart = utils.timeStart();

		await new Promise<void>((resolve, reject) => {
			const stream = function_();

			stream.once('error', (error: Error) => {
				reject(error);
			});
			stream.on('data', (entry: string) => {
				entries.push(entry);
			});
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

	public async measurePreviousVersion(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importPreviousFastGlob);

		// @ts-expect-error remove this line after the next major release.
		await this.#measure(() => glob.globStream(this.#pattern, this.#options));
	}

	public async measureCurrentVersion(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		await this.#measure(() => glob.globStream(this.#pattern, this.#options));
	}
}

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

		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		default: {
			throw new TypeError('Unknown glob implementation.');
		}
	}
})();
