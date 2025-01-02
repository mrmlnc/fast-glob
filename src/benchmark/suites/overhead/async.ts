import * as path from 'node:path';
import * as util from 'node:util';

import * as bencho from 'bencho';

import * as utils from '../../utils.js';

type MeasurableImplementation = 'fast-glob' | 'fs-walk';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ImplementationFunction = (...args: any[]) => Promise<unknown[]>;

class Glob {
	readonly #cwd: string;
	readonly #pattern: string;

	constructor(cwd: string, pattern: string) {
		this.#cwd = cwd;
		this.#pattern = pattern;
	}

	public async measureFastGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		await this.#measure(() => glob.glob(this.#pattern, {
			cwd: this.#cwd,
			unique: false,
			onlyFiles: false,
			followSymbolicLinks: false,
		}));
	}

	public async measureFsWalk(): Promise<void> {
		const fsWalk = await utils.importAndMeasure(() => import('@nodelib/fs.walk'));

		const walk = util.promisify(fsWalk.walk);

		const settings = new fsWalk.Settings({
			deepFilter: (entry) => this.#pattern !== '*' && !entry.name.startsWith('.'),
			entryFilter: (entry) => !entry.name.startsWith('.'),
		});

		await this.#measure(() => walk(this.#cwd, settings));
	}

	async #measure(function_: ImplementationFunction): Promise<void> {
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
	const impl = args[2] as MeasurableImplementation;

	if (!['*', '**'].includes(pattern)) {
		throw new TypeError('Unknown pattern.');
	}

	const glob = new Glob(cwd, pattern);

	switch (impl) {
		case 'fast-glob': {
			await glob.measureFastGlob();
			break;
		}

		case 'fs-walk': {
			await glob.measureFsWalk();
			break;
		}

		default: {
			throw new TypeError('Unknown implementation.');
		}
	}
})();
