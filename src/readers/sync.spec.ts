import * as assert from 'assert';

import { Stats } from '@nodelib/fs.macchiato';
import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';
import * as sinon from 'sinon';

import Settings, { Options } from '../settings';
import * as tests from '../tests';
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
	return { ...options } as unknown as ReaderOptions;
}

describe('Readers → ReaderSync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = getReader();

			assert.ok(reader instanceof TestReader);
		});
	});

	describe('.dynamic', () => {
		it('should call fs.walk method', () => {
			const reader = getReader();
			const readerOptions = getReaderOptions();

			reader.dynamic('root', readerOptions);

			assert.ok(reader.walkSync.called);
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

		it('should throw an error when the filter does not suppress the error', () => {
			const reader = getReader();
			const readerOptions = getReaderOptions({
				errorFilter: () => false,
				entryFilter: () => true,
			});

			reader.statSync.onFirstCall().throws(tests.errno.getEperm());
			reader.statSync.onSecondCall().returns(new Stats());

			const expectedErrorMessageRe = /Error: EPERM: operation not permitted/;

			assert.throws(() => reader.static(['a.txt', 'b.txt'], readerOptions), expectedErrorMessageRe);
		});

		it('should do not throw an error when the filter suppress the error', () => {
			const reader = getReader();
			const readerOptions = getReaderOptions({
				errorFilter: () => true,
				entryFilter: () => true,
			});

			reader.statSync.onFirstCall().throws(tests.errno.getEnoent());
			reader.statSync.onSecondCall().returns(new Stats());

			const actual = reader.static(['a.txt', 'b.txt'], readerOptions);

			assert.strictEqual(actual.length, 1);
			assert.strictEqual(actual[0].name, 'b.txt');
		});

		it('should do not include entry when the filter excludes it', () => {
			const reader = getReader();
			const readerOptions = getReaderOptions({ entryFilter: () => false });

			reader.statSync.returns(new Stats());

			const actual = reader.static(['a.txt'], readerOptions);

			assert.strictEqual(actual.length, 0);
		});
	});
});
