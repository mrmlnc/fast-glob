import * as assert from 'assert';
import { PassThrough } from 'stream';

import * as sinon from 'sinon';

import { Task } from '../managers/tasks';
import ReaderStream from '../readers/stream';
import Settings, { Options } from '../settings';
import * as tests from '../tests';
import { Entry, EntryItem, ErrnoException } from '../types';
import ProviderStream from './stream';

class TestProvider extends ProviderStream {
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

	return new Promise((resolve, reject) => {
		const items: EntryItem[] = [];

		const api = provider.read(task);

		api.on('data', (item: EntryItem) => items.push(item));
		api.once('error', reject);
		api.once('end', () => resolve(items));
	});
}

describe('Providers → ProviderStream', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const provider = getProvider();

			assert.ok(provider instanceof ProviderStream);
		});
	});

	describe('.read', () => {
		it('should return entries for dynamic entries', async () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').positive('*').build();
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			const expected = ['root/file.txt'];

			const actual = await getEntries(provider, task, entry);

			assert.strictEqual(provider.reader.dynamic.callCount, 1);
			assert.deepStrictEqual(actual, expected);
		});

		it('should return entries for static entries', async () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').static().positive('root/file.txt').build();
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			const expected = ['root/file.txt'];

			const actual = await getEntries(provider, task, entry);

			assert.strictEqual(provider.reader.static.callCount, 1);
			assert.deepStrictEqual(actual, expected);
		});

		it('should emit error to the transform stream', (done) => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').positive('*').build();
			const stream = new PassThrough({
				read(): void {
					stream.emit('error', tests.errno.getEnoent());
				},
			});

			provider.reader.dynamic.returns(stream);

			const actual = provider.read(task);

			actual.once('error', (error: ErrnoException) => {
				assert.strictEqual(error.code, 'ENOENT');
				done();
			});
		});

		it('should destroy source stream when the destination stream is closed', (done) => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').positive('*').build();
			const stream = new PassThrough();

			provider.reader.dynamic.returns(stream);

			const actual = provider.read(task);

			actual.once('close', () => {
				assert.ok(stream.destroyed);

				done();
			});

			actual.emit('close');
		});
	});
});
