import * as assert from 'assert';

import { Stats } from '@nodelib/fs.macchiato';
import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';
import * as sinon from 'sinon';

import Settings, { Options } from '../settings';
import * as tests from '../tests/index';
import { ReaderOptions } from '../types';
import ReaderSync from './sync';

type WalkSignature = typeof fsWalk.walkSync;
type StatSignature = typeof fsStat.statSync;

class TestReader extends ReaderSync {
	protected _walkSync: WalkSignature = sinon.stub() as unknown as WalkSignature;
	protected _statSync: StatSignature = sinon.stub() as unknown as StatSignature;

	constructor(options?: Options) {
		super(new Settings(options));
	}

	public get walkSync(): sinon.SinonStub {
		return this._walkSync as unknown as sinon.SinonStub;
	}

	public get statSync(): sinon.SinonStub {
		return this._statSync as unknown as sinon.SinonStub;
	}
}

function getReader(options?: Options): TestReader {
	return new TestReader(options);
}

function getReaderOptions(options: Partial<ReaderOptions> = {}): ReaderOptions {
	return { ...options } as ReaderOptions;
}

describe('Readers → ReaderSync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = getReader();

			assert.ok(reader instanceof TestReader);
		});
	});

	describe('.dynamic', () => {
		it('should return an empty array when walk throw an ENOENT error', () => {
			const reader = getReader();
			const readerOptions = getReaderOptions();

			reader.walkSync.throws(tests.errno.getEnoent());

			const actual = reader.dynamic('root', readerOptions);

			assert.strictEqual(actual.length, 0);
		});

		it('should return an empty array when walk throw an EPERM error when the `suppressErrors` option is enabled', () => {
			const reader = getReader({ suppressErrors: true });
			const readerOptions = getReaderOptions();

			reader.walkSync.throws(tests.errno.getEperm());

			const actual = reader.dynamic('root', readerOptions);

			assert.strictEqual(actual.length, 0);
		});

		it('should re-throw non-ENOENT error', () => {
			const reader = getReader();
			const readerOptions = getReaderOptions();

			reader.walkSync.throws(tests.errno.getEperm());

			const expectedErrorMessageRe = /Error: EPERM: operation not permitted/;

			assert.throws(() => reader.dynamic('root', readerOptions), expectedErrorMessageRe);
		});
	});

	describe('.static', () => {
		it('should return entries', () => {
			const reader = getReader();
			const readerOptions = getReaderOptions({ entryFilter: () => true });

			reader.statSync.onFirstCall().returns(new Stats());
			reader.statSync.onSecondCall().returns(new Stats());

			const actual = reader.static(['a.txt', 'b.txt'], readerOptions);

			assert.strictEqual(actual[0].name, 'a.txt');
			assert.strictEqual(actual[1].name, 'b.txt');
		});

		it('should not re-throw ENOENT error', () => {
			const reader = getReader();
			const readerOptions = getReaderOptions({ entryFilter: () => true });

			reader.statSync.onFirstCall().throws(tests.errno.getEnoent());
			reader.statSync.onSecondCall().returns(new Stats());

			const actual = reader.static(['a.txt', 'b.txt'], readerOptions);

			assert.strictEqual(actual.length, 1);
			assert.strictEqual(actual[0].name, 'b.txt');
		});

		it('should not re-throw EPERM error when the `suppressErrors` option is enabled', () => {
			const reader = getReader({ suppressErrors: true });
			const readerOptions = getReaderOptions({ entryFilter: () => true });

			reader.statSync.onFirstCall().throws(tests.errno.getEperm());
			reader.statSync.onSecondCall().returns(new Stats());

			const actual = reader.static(['a.txt', 'b.txt'], readerOptions);

			assert.strictEqual(actual.length, 1);
			assert.strictEqual(actual[0].name, 'b.txt');
		});

		it('should re-throw non-ENOENT error', () => {
			const reader = getReader();
			const readerOptions = getReaderOptions();

			reader.statSync.throws(tests.errno.getEperm());

			const expectedErrorMessageRe = /Error: EPERM: operation not permitted/;

			assert.throws(() => reader.static(['a.txt', 'b.txt'], readerOptions), expectedErrorMessageRe);
		});

		it('should do not include entry when filter exclude it', () => {
			const reader = getReader();
			const readerOptions = getReaderOptions({ entryFilter: () => false });

			reader.statSync.returns(new Stats());

			const actual = reader.static(['a.txt'], readerOptions);

			assert.strictEqual(actual.length, 0);
		});
	});
});
