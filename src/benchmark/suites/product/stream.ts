import * as path from 'node:path';

import * as bencho from 'bencho';

import * as utils from '../../utils';

type GlobImplementation = 'fast-glob' | 'node-glob';
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

		const stream = glob.globStream(this.#pattern, {
			cwd: this.#cwd,
			nodir: true,
		});

		await this.#measure(async () => {
			const entries: string[] = [];

			for await (const entry of stream) {
				entries.push(entry);
			}

			return entries;
		});
	}

	public async measureFastGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		const stream = glob.stream(this.#pattern, {
			cwd: this.#cwd,
			unique: false,
			followSymbolicLinks: false,
			concurrency: Number.POSITIVE_INFINITY,
		});

		await this.#measure(async () => {
			const entries: string[] = [];

			for await (const entry of stream) {
				entries.push(entry as string);
			}

			return entries;
		});
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

		default: {
			throw new TypeError('Unknown glob implementation.');
		}
	}
})();
