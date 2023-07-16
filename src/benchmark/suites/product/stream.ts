import * as path from 'path';
import * as bencho from 'bencho';

import * as utils from '../../utils';

type GlobImplementation = 'node-glob' | 'fast-glob';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => Promise<unknown[]>;

class Glob {
	constructor(private readonly _cwd: string, private readonly _pattern: string) {}

	public async measureNodeGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importNodeGlob);

		const entries: string[] = [];

		const stream = glob.globStream(this._pattern, {
			cwd: this._cwd,
			nodir: true
		});

		const action = new Promise<string[]>((resolve, reject) => {
			stream.on('error', (error) => reject(error));
			stream.on('data', (entry: string) => entries.push(entry));
			stream.on('end', () => resolve(entries));
		});

		await this._measure(() => action);
	}

	public async measureFastGlob(): Promise<void> {
		const glob = await utils.importAndMeasure(utils.importCurrentFastGlob);

		const entries: string[] = [];

		const stream = glob.stream(this._pattern, {
			cwd: this._cwd,
			unique: false,
			followSymbolicLinks: false,
			concurrency: Number.POSITIVE_INFINITY
		});

		const action = new Promise<string[]>((resolve, reject) => {
			stream.once('error', (error) => reject(error));
			stream.on('data', (entry: string) => entries.push(entry));
			stream.once('end', () => resolve(entries));
		});

		await this._measure(() => action);
	}

	private async _measure(func: GlobImplFunction): Promise<void> {
		const timeStart = utils.timeStart();

		const matches = await func();

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
		case 'node-glob':
			await glob.measureNodeGlob();
			break;

		case 'fast-glob':
			await glob.measureFastGlob();
			break;

		default:
			throw new TypeError(`Unknown glob implementation: ${impl}`);
	}
})();
