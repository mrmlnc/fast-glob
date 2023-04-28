import * as assert from 'assert';

import * as sinon from 'sinon';

import Settings from '../settings';
import * as tests from '../tests';
import ReaderAsync from '../readers/async';
import ProviderAsync from './async';

import type { Task } from '../managers/tasks';
import type ReaderStream from '../readers/stream';
import type { Options } from '../settings';
import type { Entry, EntryItem, ErrnoException } from '../types';

class TestProvider extends ProviderAsync {
	protected override _reader: ReaderAsync = sinon.createStubInstance(ReaderAsync) as unknown as ReaderAsync;

	constructor(options?: Options) {
		super(new Settings(options));
	}

	public get reader(): sinon.SinonStubbedInstance<ReaderStream> {
		return this._reader as unknown as sinon.SinonStubbedInstance<ReaderStream>;
	}
}

function getProvider(options?: Options): TestProvider {
	return new TestProvider(options);
}

function getEntries(provider: TestProvider, task: Task, entry: Entry): Promise<EntryItem[]> {
	provider.reader.dynamic.resolves([entry]);
	provider.reader.static.resolves([entry]);

	return provider.read(task);
}

describe('Providers → ProviderAsync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const provider = getProvider();

			assert.ok(provider instanceof ProviderAsync);
		});
	});

	describe('.read', () => {
		it('should return entries for dynamic task', async () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').positive('*').build();
			const entry = tests.entry.builder().path('root/file.txt').build();

			const expected = ['root/file.txt'];

			const actual = await getEntries(provider, task, entry);

			assert.strictEqual(provider.reader.dynamic.callCount, 1);
			assert.deepStrictEqual(actual, expected);
		});

		it('should return entries for static task', async () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').static().positive('*').build();
			const entry = tests.entry.builder().path('root/file.txt').build();

			const expected = ['root/file.txt'];

			const actual = await getEntries(provider, task, entry);

			assert.strictEqual(provider.reader.static.callCount, 1);
			assert.deepStrictEqual(actual, expected);
		});

		it('should throw error', async () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').positive('*').build();

			provider.reader.dynamic.rejects(tests.errno.getEnoent());

			try {
				await provider.read(task);

				throw new Error('Wow');
			} catch (error) {
				assert.strictEqual((error as ErrnoException).code, 'ENOENT');
			}
		});
	});
});
