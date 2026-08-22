import * as path from 'node:path';
import * as process from 'node:process';
import * as bencho from 'bencho';
import * as utils from '../../utils.js';

type MeasurableImplementation = 'fast-glob' | 'fs-walk';

type ImplementationFunction = (...args: any[]) => unknown[];

class Glob {
	readonly #cwd: string;
	readonly #pattern: string;

	constructor(cwd: string, pattern: string) {
		this.#cwd = cwd;
		this.#pattern = pattern;
	}

	#measure(function_: ImplementationFunction): void {
		const timeStart = utils.timeStart();

		const matches = function_();

		const count = matches.length;
		const memory = utils.getMemory();
		const time = utils.timeEnd(timeStart);

		bencho.time('time', time);
		bencho.memory('memory', memory);
		bencho.value('entries', count);
	}

	public async measureFastGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		this.#measure(() => glob.globSync(this.#pattern, {
			cwd: this.#cwd,
			unique: false,
			onlyFiles: false,
			followSymbolicLinks: false,
		}));
	}

	public async measureFsWalk(): Promise<void> {
		const fsWalk = await utils.importAndMeasure(async () => import('@nodelib/fs.walk'));

		const settings = new fsWalk.Settings({
			deepFilter: (entry) => this.#pattern !== '*' && !entry.name.startsWith('.'),
			entryFilter: (entry) => !entry.name.startsWith('.'),
		});

		this.#measure(() => fsWalk.walkSync(this.#cwd, settings));
	}
}

(async () => {
	const args = process.argv.slice(2);

	const cwd = path.join(process.cwd(), args[0]);
	const pattern = args[1];

	if (!['*', '**'].includes(pattern)) {
		throw new TypeError('Unknown pattern.');
	}

	const impl = args[2] as MeasurableImplementation;
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

		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		default: {
			throw new TypeError('Unknown implementation.');
		}
	}
})();
