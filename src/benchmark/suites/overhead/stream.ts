import * as path from 'node:path';
import * as process from 'node:process';
import * as bencho from 'bencho';
import type { Entry } from '@nodelib/fs.walk';
import * as utils from '../../utils.js';

type MeasurableImplementation = 'fast-glob' | 'fs-walk';

type ImplementationFunction = (...args: any[]) => Promise<unknown[]>;

class Glob {
	readonly #cwd: string;
	readonly #pattern: string;

	constructor(cwd: string, pattern: string) {
		this.#cwd = cwd;
		this.#pattern = pattern;
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

	public async measureFastGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		const entries: string[] = [];

		const stream = glob.globStream(this.#pattern, {
			cwd: this.#cwd,
			unique: false,
			onlyFiles: false,
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

	public async measureFsWalk(): Promise<void> {
		const fsWalk = await utils.importAndMeasure(async () => import('@nodelib/fs.walk'));

		const settings = new fsWalk.Settings({
			deepFilter: (entry) => this.#pattern !== '*' && !entry.name.startsWith('.'),
			entryFilter: (entry) => !entry.name.startsWith('.'),
		});

		const entries: Entry[] = [];

		const stream = fsWalk.walkStream(this.#cwd, settings);

		const action = new Promise<Entry[]>((resolve, reject) => {
			stream.once('error', (error) => {
				reject(error);
			});
			stream.on('data', (entry: Entry) => {
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
