import * as assert from 'assert';
import * as path from 'path';

import Settings from '../settings';
import * as tests from '../tests';
import Provider from './provider';

import type { Task } from '../managers/tasks';
import type { Options } from '../settings';
import type { MicromatchOptions, ReaderOptions } from '../types';


export class TestProvider extends Provider<Array<{}>> {
	public read(): Array<{}> {
		return [];
	}

	public getRootDirectory(task: Task): string {
		return this._getRootDirectory(task);
	}

	public getReaderOptions(task: Task): ReaderOptions {
		return this._getReaderOptions(task);
	}

	public getMicromatchOptions(): MicromatchOptions {
		return this._getMicromatchOptions();
	}
}

export function getProvider(options?: Options): TestProvider {
	const settings = new Settings(options);

	return new TestProvider(settings);
}

describe('Providers → Provider', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const provider = getProvider();

			assert.ok(provider instanceof Provider);
		});
	});

	describe('.getRootDirectory', () => {
		it('should return root directory for reader with global base (.)', () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').build();

			const expected = process.cwd();

			const actual = provider.getRootDirectory(task);

			assert.strictEqual(actual, expected);
		});

		it('should return root directory for reader with non-global base (fixtures)', () => {
			const provider = getProvider();
			const task = tests.task.builder().base('root').build();

			const expected = path.join(process.cwd(), 'root');

			const actual = provider.getRootDirectory(task);

			assert.strictEqual(actual, expected);
		});
	});

	describe('.getReaderOptions', () => {
		it('should return options for reader with global base (.)', () => {
			const settings = new Settings();
			const provider = getProvider(settings);
			const task = tests.task.builder().base('.').positive('*').build();

			const actual = provider.getReaderOptions(task);

			assert.strictEqual(actual.basePath, '');
			assert.strictEqual(actual.concurrency, settings.concurrency);
			assert.strictEqual(typeof actual.deepFilter, 'function');
			assert.strictEqual(typeof actual.entryFilter, 'function');
			assert.strictEqual(typeof actual.errorFilter, 'function');
			assert.ok(actual.followSymbolicLinks);
			assert.strictEqual(typeof actual.fs, 'object');
			assert.ok(!actual.stats);
			assert.ok(actual.throwErrorOnBrokenSymbolicLink === false);
			assert.strictEqual(typeof actual.transform, 'function');
		});

		it('should return options for reader with non-global base', () => {
			const provider = getProvider();
			const task = tests.task.builder().base('root').positive('*').build();

			const actual = provider.getReaderOptions(task);

			assert.strictEqual(actual.basePath, 'root');
		});
	});

	describe('.getMicromatchOptions', () => {
		it('should return options for micromatch', () => {
			const provider = getProvider();

			const expected: MicromatchOptions = {
				dot: false,
				matchBase: false,
				nobrace: false,
				nocase: false,
				noext: false,
				noglobstar: false,
				posix: true,
				strictSlashes: false,
			};

			const actual = provider.getMicromatchOptions();

			assert.deepStrictEqual(actual, expected);
		});
	});
});
