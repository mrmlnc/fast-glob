import * as path from 'node:path';

import * as bencho from 'bencho';

import * as utils from '../../utils';

type GlobImplementation = 'fast-glob' | 'native' | 'node-glob' | 'tinyglobby';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => Promise<unknown[]>;

class Glob {
	readonly #cwd: string;
	readonly #pattern: string;

	constructor(cwd: string, pattern: string) {
		this.#cwd = cwd;
		this.#pattern = pattern;
	}

	/**
	 * Assumptions:
	 *
	 * 1. The implementation returns entries with an absolute path, while all other solutions return a relative path.
	 */
	public async measureNative(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importNativeGlob);

		await this.#measure(async () => {
			const iterator = await glob.glob(this.#pattern, {
				cwd: this.#cwd,
				withFileTypes: true,
			});

			const entries: string[] = [];

			for await (const dirent of iterator) {
				if (!dirent.isDirectory()) {
					entries.push(`${dirent.parentPath}/${dirent.name}`);
				}
			}

			return entries;
		});
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

		await this.#measure(() => glob.glob(this.#pattern, {
			cwd: this.#cwd,
			unique: false,
			followSymbolicLinks: false,
		}));
	}

	public async measureTinyGlobby(): Promise<void> {
		const tinyglobby = await utils.importAndMeasure(utils.importTinyGlobby);

		await this.#measure(() => tinyglobby.glob(this.#pattern, {
			cwd: this.#cwd,
			followSymbolicLinks: false,
		}));
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
		case 'native': {
			await glob.measureNative();
			break;
		}

		case 'node-glob': {
			await glob.measureNodeGlob();
			break;
		}

		case 'fast-glob': {
			await glob.measureFastGlob();
			break;
		}

		case 'tinyglobby': {
			await glob.measureTinyGlobby();
			break;
		}

		default: {
			throw new TypeError('Unknown glob implementation.');
		}
	}
})();
