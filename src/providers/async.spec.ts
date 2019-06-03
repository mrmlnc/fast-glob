import * as assert from 'assert';
import { PassThrough } from 'stream';

import * as sinon from 'sinon';

import { Task } from '../managers/tasks';
import ReaderStream from '../readers/stream';
import Settings, { Options } from '../settings';
import * as tests from '../tests/index';
import { Entry, EntryItem, ErrnoException } from '../types/index';
import ProviderAsync from './async';

class TestProvider extends ProviderAsync {
	protected _reader: ReaderStream = sinon.createStubInstance(ReaderStream) as unknown as ReaderStream;

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
	const reader = new PassThrough({ objectMode: true });

	provider.reader.dynamic.returns(reader);
	provider.reader.static.returns(reader);

	reader.push(entry);
	reader.push(null);

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

		it('should call the transform function when it is presented', async () => {
			const transform = sinon.stub();
			const provider = getProvider({ transform });
			const task = tests.task.builder().base('.').positive('*').build();
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			await getEntries(provider, task, entry);

			assert.strictEqual(transform.callCount, 1);
		});

		it('should throw error', async () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').positive('*').build();
			const stream = new PassThrough({
				read(): void {
					stream.emit('error', tests.errno.getEnoent());
				}
			});

			provider.reader.dynamic.returns(stream);

			try {
				await provider.read(task);

				throw new Error('Wow');
			} catch (error) {
				assert.strictEqual((error as ErrnoException).code, 'ENOENT');
			}
		});
	});
});
