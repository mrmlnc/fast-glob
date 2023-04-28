import * as assert from 'assert';

import * as sinon from 'sinon';

import ReaderSync from '../readers/sync';
import Settings from '../settings';
import * as tests from '../tests';
import ProviderSync from './sync';

import type { Options } from '../settings';

class TestProvider extends ProviderSync {
	protected override _reader: ReaderSync = sinon.createStubInstance(ReaderSync) as unknown as ReaderSync;

	constructor(options?: Options) {
		super(new Settings(options));
	}

	public get reader(): sinon.SinonStubbedInstance<ReaderSync> {
		return this._reader as unknown as sinon.SinonStubbedInstance<ReaderSync>;
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
