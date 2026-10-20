import * as assert from 'node:assert';
import * as sinon from 'sinon';
import { describe, it } from 'mocha';
import Settings, { type Options } from '../settings.js';
import * as tests from '../tests/index.js';
import { ReaderAsync, type ReaderAsyncInterface } from '../readers/index.js';
import type { Entry, EntryItem } from '../types/index.js';
import type { Task } from '../managers/tasks.js';
import { ProviderAsync } from './async.js';

type StubbedReaderAsync = sinon.SinonStubbedInstance<ReaderAsyncInterface>;

class TestProvider extends ProviderAsync {
	public readonly reader: StubbedReaderAsync;

	constructor(
		options?: Options,
		reader: StubbedReaderAsync = sinon.createStubInstance(ReaderAsync),
	) {
		super(reader, new Settings(options));

		this.reader = reader;
	}
}

function getProvider(options?: Options): TestProvider {
	return new TestProvider(options);
}

async function getEntries(provider: TestProvider, task: Task, entry: Entry): Promise<EntryItem[]> {
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

		it('should pass only positive patterns to the static reader (#499)', async () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').static().positive('root/file.txt').negative('*.bup.txt').build();
			const entry = tests.entry.builder().path('root/file.txt').build();

			await getEntries(provider, task, entry);

			// Negative patterns are exclusion filters, not paths to stat. Passing
			// them to the static reader makes it lstat bogus paths like `!*.bup.txt`.
			assert.deepStrictEqual(provider.reader.static.firstCall.args[0], task.positive);
		});

		it('should throw error', async () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').positive('*').build();

			provider.reader.dynamic.rejects(tests.errno.getEnoent());

			await assert.rejects(provider.read(task), { code: 'ENOENT' });
		});
	});
});
