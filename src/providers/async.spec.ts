import * as assert from 'assert';

import * as sinon from 'sinon';

import { Task } from '../managers/tasks';
import ReaderStream from '../readers/stream';
import Settings, { Options } from '../settings';
import * as tests from '../tests';
import { Entry, EntryItem, ErrnoException } from '../types';
import ReaderAsync from '../readers/async';
import ProviderAsync from './async';

class TestProvider extends ProviderAsync {
	protected _reader: ReaderAsync = sinon.createStubInstance(ReaderAsync) as unknown as ReaderAsync;

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

		describe('includePatternBaseDirectory', () => {
			it('should return base pattern directory', async () => {
				const provider = getProvider({
					onlyFiles: false,
					includePatternBaseDirectory: true
				});
				const task = tests.task.builder().base('root').positive('*').build();
				const baseEntry = tests.entry.builder().path('root').directory().build();
				const fileEntry = tests.entry.builder().path('root/file.txt').file().build();

				provider.reader.static.resolves([baseEntry]);
				provider.reader.dynamic.resolves([fileEntry]);

				const expected = ['root', 'root/file.txt'];

				const actual = await provider.read(task);

				assert.strictEqual(provider.reader.static.callCount, 1);
				assert.strictEqual(provider.reader.dynamic.callCount, 1);
				assert.deepStrictEqual(actual, expected);
			});

			it('should do not read base directory for static task', async () => {
				const provider = getProvider({
					onlyFiles: false,
					includePatternBaseDirectory: true
				});

				const task = tests.task.builder().base('root').positive('file.txt').static().build();

				provider.reader.static.resolves([]);

				await provider.read(task);

				assert.strictEqual(provider.reader.static.callCount, 1);
			});

			it('should do not read base directory when it is a dot', async () => {
				const provider = getProvider({
					onlyFiles: false,
					includePatternBaseDirectory: true
				});
				const task = tests.task.builder().base('.').positive('*').build();

				provider.reader.static.resolves([]);
				provider.reader.dynamic.resolves([]);

				await provider.read(task);

				assert.strictEqual(provider.reader.static.callCount, 0);
			});
		});
	});
});
