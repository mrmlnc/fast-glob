import * as path from 'node:path';
import * as process from 'node:process';
import * as bencho from 'bencho';
import * as utils from '../../utils.js';

type GlobImplementation = 'fast-glob' | 'node-fs-glob' | 'node-glob' | 'tinyglobby';

type GlobImplFunction = (...args: any[]) => unknown[];

class Glob {
	readonly #cwd: string;
	readonly #pattern: string;

	constructor(cwd: string, pattern: string) {
		this.#cwd = cwd;
		this.#pattern = pattern;
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

	public async measureNodeGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importNodeGlob);

		this.#measure(() => glob.globSync(this.#pattern, {
			cwd: this.#cwd,
			nodir: true,
		}));
	}

	public async measureNodeFsGlob(): Promise<void> {
		const fs = await utils.importAndMeasure(utils.importNodeFsGlob);

		this.#measure(() => {
			const entries = fs.globSync(this.#pattern, {
				cwd: this.#cwd,
				withFileTypes: true,
			});

			return entries.filter((entry) => !entry.isDirectory());
		});
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
}

(async () => {
	const args = process.argv.slice(2);

	const cwd = path.join(process.cwd(), args[0]);
	const pattern = args[1];
	const impl = args[2] as GlobImplementation;

	const glob = new Glob(cwd, pattern);

	switch (impl) {
		case 'node-fs-glob': {
			await glob.measureNodeFsGlob();
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

		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		default: {
			throw new TypeError('Unknown glob implementation.');
		}
	}
})();
