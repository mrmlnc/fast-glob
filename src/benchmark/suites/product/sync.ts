import * as path from 'node:path';

import * as bencho from 'bencho';

import * as utils from '../../utils.js';

type GlobImplementation = 'fast-glob' | 'node-glob' | 'tinyglobby';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => unknown[];

class Glob {
	readonly #cwd: string;
	readonly #pattern: string;

	constructor(cwd: string, pattern: string) {
		this.#cwd = cwd;
		this.#pattern = pattern;
	}

	public async measureNodeGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importNodeGlob);

		this.#measure(() => glob.globSync(this.#pattern, {
			cwd: this.#cwd,
			nodir: true,
		}));
	}

	public async measureFastGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		this.#measure(() => glob.globSync(this.#pattern, {
			cwd: this.#cwd,
			unique: false,
			followSymbolicLinks: false,
		}));
	}

	public async measureTinyGlobby(): Promise<void> {
		const tinyglobby = await utils.importAndMeasure(utils.importTinyGlobby);

		this.#measure(() => tinyglobby.globSync(this.#pattern, {
			cwd: this.#cwd,
			followSymbolicLinks: false,
		}));
	}

	#measure(function_: GlobImplFunction): void {
		const timeStart = utils.timeStart();

		const matches = function_();

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

		case 'tinyglobby': {
			await glob.measureTinyGlobby();
			break;
		}

		default: {
			throw new TypeError('Unknown glob implementation.');
		}
	}
})();
