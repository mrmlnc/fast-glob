import * as assert from 'node:assert';
import { PassThrough } from 'node:stream';

import * as sinon from 'sinon';
import { describe, it } from 'mocha';

import Settings from '../settings.js';
import * as tests from '../tests/index.js';
import { ProviderStream } from './stream.js';
import { ReaderStream } from '../readers/index.js';

import type { IReaderStream } from '../readers/index.js';
import type { Options } from '../settings.js';
import type { Entry, EntryItem, ErrnoException } from '../types/index.js';
import type { Task } from '../managers/tasks.js';

type StubbedReaderStream = sinon.SinonStubbedInstance<IReaderStream>;

class TestProvider extends ProviderStream {
	public readonly reader: StubbedReaderStream;

	constructor(
		options?: Options,
		reader: StubbedReaderStream = sinon.createStubInstance(ReaderStream),
	) {
		super(reader, new Settings(options));

		this.reader = reader;
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
		api.once('end', () => {
			resolve(items);
		});
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
