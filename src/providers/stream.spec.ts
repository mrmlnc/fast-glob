import * as assert from 'assert';
import { PassThrough, Readable } from 'stream';

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
	// Replace by PassThrough.from after when targeting Node.js 12+.
	const reader = new PassThrough({ objectMode: true });

	provider.reader.dynamic.returns(reader);
	provider.reader.static.returns(reader);

	reader.push(entry);
	reader.push(null);

	const stream = provider.read(task);

	return waitStreamEnd(stream);
}

function waitStreamEnd(stream: Readable): Promise<EntryItem[]> {
	return new Promise((resolve, reject) => {
		const items: EntryItem[] = [];

		stream.on('data', (item: EntryItem) => items.push(item));
		stream.once('error', reject);
		stream.once('end', () => resolve(items));
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
				}
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

	describe('includePatternBaseDirectory', () => {
		it('should return base pattern directory', async () => {
			const provider = getProvider({
				onlyFiles: false,
				includePatternBaseDirectory: true
			});
			const task = tests.task.builder().base('root').positive('*').build();
			const baseEntry = tests.entry.builder().path('root').directory().build();
			const fileEntry = tests.entry.builder().path('root/file.txt').file().build();

			// Replace by PassThrough.from after when targeting Node.js 12+.
			const staticReaderStream = new PassThrough({ objectMode: true });
			const dynamicReaderStream = new PassThrough({ objectMode: true });

			provider.reader.static.returns(staticReaderStream);
			provider.reader.dynamic.returns(dynamicReaderStream);

			staticReaderStream.push(baseEntry);
			staticReaderStream.push(null);
			dynamicReaderStream.push(fileEntry);
			dynamicReaderStream.push(null);

			const expected = ['root', 'root/file.txt'];

			const actual = await waitStreamEnd(provider.read(task));

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
			const baseEntry = tests.entry.builder().path('root/file.txt').directory().build();

			// Replace by PassThrough.from after when targeting Node.js 12+.
			const staticReaderStream = new PassThrough({ objectMode: true });
			const dynamicReaderStream = new PassThrough({ objectMode: true });

			provider.reader.static.returns(staticReaderStream);
			provider.reader.dynamic.returns(dynamicReaderStream);

			staticReaderStream.push(baseEntry);
			staticReaderStream.push(null);
			dynamicReaderStream.push(null);

			await waitStreamEnd(provider.read(task));

			assert.strictEqual(provider.reader.static.callCount, 1);
		});

		it('should do not read base directory when it is a dot', async () => {
			const provider = getProvider({
				onlyFiles: false,
				includePatternBaseDirectory: true
			});
			const task = tests.task.builder().base('.').positive('*').build();
			const baseEntry = tests.entry.builder().path('.').directory().build();

			// Replace by PassThrough.from after when targeting Node.js 12+.
			const staticReaderStream = new PassThrough({ objectMode: true });
			const dynamicReaderStream = new PassThrough({ objectMode: true });

			provider.reader.static.returns(staticReaderStream);
			provider.reader.dynamic.returns(dynamicReaderStream);

			staticReaderStream.push(baseEntry);
			staticReaderStream.push(null);
			dynamicReaderStream.push(null);

			await waitStreamEnd(provider.read(task));

			assert.strictEqual(provider.reader.static.callCount, 0);
		});
	});
});
