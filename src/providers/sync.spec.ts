import * as assert from 'node:assert';
import * as sinon from 'sinon';
import { describe, it } from 'mocha';
import { ReaderSync, type ReaderSyncInterface } from '../readers/index.js';
import Settings, { type Options } from '../settings.js';
import * as tests from '../tests/index.js';
import { ProviderSync } from './sync.js';

type StubbedReaderSync = sinon.SinonStubbedInstance<ReaderSyncInterface>;

class TestProvider extends ProviderSync {
	public readonly reader: StubbedReaderSync;

	constructor(
		options?: Options,
		reader: StubbedReaderSync = sinon.createStubInstance(ReaderSync),
	) {
		super(reader, new Settings(options));

		this.reader = reader;
	}
}

function getProvider(options?: Options): TestProvider {
	return new TestProvider(options);
}

describe('Providers → ProviderSync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const provider = getProvider();

			assert.ok(provider instanceof ProviderSync);
		});
	});

	describe('.read', () => {
		it('should return entries for dynamic task', () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').positive('*').build();
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			provider.reader.dynamic.returns([entry]);

			const expected = ['root/file.txt'];

			const actual = provider.read(task);

			assert.strictEqual(provider.reader.dynamic.callCount, 1);
			assert.deepStrictEqual(actual, expected);
		});

		it('should return entries for static task', () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').static().positive('root/file.txt').build();
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			provider.reader.static.returns([entry]);

			const expected = ['root/file.txt'];

			const actual = provider.read(task);

			assert.strictEqual(provider.reader.static.callCount, 1);
			assert.deepStrictEqual(actual, expected);
		});

		it('should pass only positive patterns to the static reader (#499)', () => {
			const provider = getProvider();
			const task = tests.task.builder().base('.').static().positive('root/file.txt').negative('*.bup.txt').build();
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			provider.reader.static.returns([entry]);

			provider.read(task);

			// Negative patterns are exclusion filters, not paths to stat. Passing
			// them to the static reader makes it lstat bogus paths like `!*.bup.txt`.
			assert.deepStrictEqual(provider.reader.static.firstCall.args[0], task.positive);
		});
	});
});
