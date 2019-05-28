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

class FakeReader extends ReaderSync {
	protected _walkSync: WalkSignature = sinon.stub() as unknown as WalkSignature;
	protected _statSync: StatSignature = sinon.stub() as unknown as StatSignature;

	constructor(_options?: Options) {
		super(new Settings(_options));
	}

	public get walkSync(): sinon.SinonStub {
		return this._walkSync as unknown as sinon.SinonStub;
	}

	public get statSync(): sinon.SinonStub {
		return this._statSync as unknown as sinon.SinonStub;
	}
}

function getReader(options?: Options): FakeReader {
	return new FakeReader(options);
}

describe('Readers → ReaderSync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = getReader();

			assert.ok(reader instanceof FakeReader);
		});
	});

	describe('.dynamic', () => {
		it('should return an empty array when walk throw an ENOENT error', () => {
			const reader = getReader();

			reader.walkSync.throws(new tests.EnoentErrnoException());

			const actual = reader.dynamic('root', {} as ReaderOptions);

			assert.strictEqual(actual.length, 0);
		});

		it('should return an empty array when walk throw an EPERM error when the `suppressErrors` option is enabled', () => {
			const reader = getReader({ suppressErrors: true });

			reader.walkSync.throws(new tests.EpermErrnoException());

			const actual = reader.dynamic('root', {} as ReaderOptions);

			assert.strictEqual(actual.length, 0);
		});

		it('should re-throw non-ENOENT error', () => {
			const reader = getReader();

			reader.walkSync.throws(new tests.EpermErrnoException());

			const expectedErrorMessageRe = /EPERM error/;

			assert.throws(() => reader.dynamic('root', {} as ReaderOptions), expectedErrorMessageRe);
		});
	});

	describe('.static', () => {
		it('should return entries', () => {
			const reader = getReader();

			reader.statSync.onFirstCall().returns(new Stats());
			reader.statSync.onSecondCall().returns(new Stats());

			const actual = reader.static(['a.txt', 'b.txt'], {
				entryFilter: () => true
			} as unknown as ReaderOptions);

			assert.strictEqual(actual[0].name, 'a.txt');
			assert.strictEqual(actual[1].name, 'b.txt');
		});

		it('should not re-throw ENOENT error', () => {
			const reader = getReader();

			reader.statSync.onFirstCall().throws(new tests.EnoentErrnoException());
			reader.statSync.onSecondCall().returns(new Stats());

			const actual = reader.static(['a.txt', 'b.txt'], {
				entryFilter: () => true
			} as unknown as ReaderOptions);

			assert.strictEqual(actual.length, 1);
			assert.strictEqual(actual[0].name, 'b.txt');
		});

		it('should not re-throw EPERM error when the `suppressErrors` option is enabled', () => {
			const reader = getReader({ suppressErrors: true });

			reader.statSync.onFirstCall().throws(new tests.EpermErrnoException());
			reader.statSync.onSecondCall().returns(new Stats());

			const actual = reader.static(['a.txt', 'b.txt'], {
				entryFilter: () => true
			} as unknown as ReaderOptions);

			assert.strictEqual(actual.length, 1);
			assert.strictEqual(actual[0].name, 'b.txt');
		});

		it('should re-throw non-ENOENT error', () => {
			const reader = getReader();

			reader.statSync.throws(new tests.EpermErrnoException());

			const expectedErrorMessageRe = /EPERM error/;

			assert.throws(() => reader.static(['a.txt', 'b.txt'], {} as ReaderOptions), expectedErrorMessageRe);
		});

		it('should do not include entry when filter exclude it', () => {
			const reader = getReader();

			reader.statSync.returns(new Stats());

			const actual = reader.static(['a.txt'], {
				entryFilter: () => false
			} as unknown as ReaderOptions);

			assert.strictEqual(actual.length, 0);
		});
	});
});
