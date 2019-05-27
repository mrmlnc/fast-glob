import * as assert from 'assert';

import { Stats } from '@nodelib/fs.macchiato';
import * as fsStat from '@nodelib/fs.stat';
import * as fsWalk from '@nodelib/fs.walk';
import * as sinon from 'sinon';

import Settings, { Options } from '../settings';
import * as tests from '../tests/index';
import { Entry, ErrnoException, ReaderOptions } from '../types';
import ReaderStream from './stream';

type WalkSignature = typeof fsWalk.walkStream;
type StatSignature = typeof fsStat.stat;

class FakeReader extends ReaderStream {
	protected _walkStream: WalkSignature = sinon.stub() as unknown as WalkSignature;
	protected _stat: StatSignature = sinon.stub() as unknown as StatSignature;

	constructor(_options?: Options) {
		super(new Settings(_options));
	}

	public get walkStream(): sinon.SinonStub {
		return this._walkStream as unknown as sinon.SinonStub;
	}

	public get stat(): sinon.SinonStub {
		return this._stat as unknown as sinon.SinonStub;
	}
}

function getReader(options?: Options): FakeReader {
	return new FakeReader(options);
}

describe('Readers → ReaderStream', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = getReader();

			assert.ok(reader instanceof FakeReader);
		});
	});

	describe('.dynamic', () => {
		it('should return entries', () => {
			const reader = getReader();

			reader.dynamic('root', {} as ReaderOptions);

			assert.ok(reader.walkStream.calledOnce);
		});
	});

	describe('.static', () => {
		it('should return entries', (done) => {
			const reader = getReader();

			reader.stat.onFirstCall().yields(null, new Stats());
			reader.stat.onSecondCall().yields(null, new Stats());

			const entries: Entry[] = [];

			const stream = reader.static(['a.txt', 'b.txt'], {
				entryFilter: () => true
			} as unknown as ReaderOptions);

			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('end', () => {
				assert.strictEqual(entries[0].name, 'a.txt');
				assert.strictEqual(entries[1].name, 'b.txt');
				done();
			});
		});

		it('should not re-throw ENOENT error', (done) => {
			const reader = getReader();

			reader.stat.onFirstCall().yields(new tests.EnoentErrnoException());
			reader.stat.onSecondCall().yields(null, new Stats());

			const entries: Entry[] = [];

			const stream = reader.static(['a.txt', 'b.txt'], {
				entryFilter: () => true
			} as unknown as ReaderOptions);

			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('end', () => {
				assert.strictEqual(entries[0].name, 'b.txt');
				done();
			});
		});

		it('should not re-throw EPERM error when the `suppressErrors` option is enabled', (done) => {
			const reader = getReader({ suppressErrors: true });

			reader.stat.onFirstCall().yields(new tests.EpermErrnoException());
			reader.stat.onSecondCall().yields(null, new Stats());

			const entries: Entry[] = [];

			const stream = reader.static(['a.txt', 'b.txt'], {
				entryFilter: () => true
			} as unknown as ReaderOptions);

			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('end', () => {
				assert.strictEqual(entries[0].name, 'b.txt');
				done();
			});
		});

		it('should re-throw non-ENOENT error', (done) => {
			const reader = getReader();

			reader.stat.yields(new tests.EpermErrnoException());

			const stream = reader.static(['a.txt', 'b.txt'], {} as ReaderOptions);

			stream.on('data', () => { /* nope */ });
			stream.once('error', (error: ErrnoException) => {
				assert.strictEqual(error.code, 'EPERM');
				done();
			});
		});

		it('should do not include entry when filter exclude it', (done) => {
			const reader = getReader();

			reader.stat.yields(null, new Stats());

			const entries: Entry[] = [];

			const stream = reader.static(['a.txt'], {
				entryFilter: () => false
			} as unknown as ReaderOptions);

			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('end', () => {
				assert.strictEqual(entries.length, 0);
				done();
			});
		});
	});
});
