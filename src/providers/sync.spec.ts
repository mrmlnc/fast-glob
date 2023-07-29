import * as assert from 'node:assert';

import * as sinon from 'sinon';

import { ReaderSync } from '../readers';
import Settings from '../settings';
import * as tests from '../tests';
import { ProviderSync } from './sync';

import type { IReaderSync } from '../readers';
import type { Options } from '../settings';

type StubbedReaderSync = sinon.SinonStubbedInstance<IReaderSync>;

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
	});
});
