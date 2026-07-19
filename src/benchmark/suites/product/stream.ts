import * as path from 'node:path';
import * as process from 'node:process';
import * as bencho from 'bencho';
import * as utils from '../../utils';

type GlobImplementation = 'fast-glob' | 'node-fs-glob' | 'node-glob';

type GlobImplFunction = (...args: any[]) => Promise<unknown[]>;

class Glob {
	readonly #cwd: string;
	readonly #pattern: string;

	constructor(cwd: string, pattern: string) {
		this.#cwd = cwd;
		this.#pattern = pattern;
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

	public async measureNodeGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importNodeGlob);

		const entries: string[] = [];

		const stream = glob.globStream(this.#pattern, {
			cwd: this.#cwd,
			nodir: true,
		});

		const action = new Promise<string[]>((resolve, reject) => {
			stream.once('error', (error: Error) => {
				reject(error);
			});
			stream.on('data', (entry: string) => {
				entries.push(entry);
			});
			stream.on('end', () => {
				resolve(entries);
			});
		});

		await this.#measure(async () => action);
	}

	public async measureNodeFsGlob(): Promise<void> {
		const fs = await utils.importAndMeasure(utils.importNodeFsGlob);

		const action = new Promise<unknown[]>((resolve, reject) => {
			fs.glob(this.#pattern, {
				cwd: this.#cwd,
				withFileTypes: true,
			}, (error, entries) => {
				if (error !== null) {
					reject(error);
					return;
				}

				const result = entries.filter((entry) => !entry.isDirectory());

				resolve(result);
			});
		});

		await this.#measure(async () => action);
	}

	public async measureFastGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		const entries: string[] = [];

		const stream = glob.globStream(this.#pattern, {
			cwd: this.#cwd,
			unique: false,
			followSymbolicLinks: false,
		});

		const action = new Promise<string[]>((resolve, reject) => {
			stream.once('error', (error: Error) => {
				reject(error);
			});
			stream.on('data', (entry: string) => {
				entries.push(entry);
			});
			stream.once('end', () => {
				resolve(entries);
			});
		});

		await this.#measure(async () => action);
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

		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		default: {
			throw new TypeError('Unknown glob implementation.');
		}
	}
})();
