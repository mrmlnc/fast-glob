import * as assert from 'assert';

import { Stats } from '@nodelib/fs.macchiato';
import * as sinon from 'sinon';

import Settings from '../settings';
import * as tests from '../tests';
import ReaderStream from './stream';

import type * as fsStat from '@nodelib/fs.stat';
import type * as fsWalk from '@nodelib/fs.walk';
import type { Options } from '../settings';
import type { Entry, ErrnoException, ReaderOptions } from '../types';

type WalkSignature = typeof fsWalk.walkStream;
type StatSignature = typeof fsStat.stat;

class TestReader extends ReaderStream {
	protected _walkStream: WalkSignature = sinon.stub() as unknown as WalkSignature;
	protected _stat: StatSignature = sinon.stub() as unknown as StatSignature;

	constructor(options?: Options) {
		super(new Settings(options));
	}

	public get walkStream(): sinon.SinonStub {
		return this._walkStream as unknown as sinon.SinonStub;
	}

	public get stat(): sinon.SinonStub {
		return this._stat as unknown as sinon.SinonStub;
	}
}

function getReader(options?: Options): TestReader {
	return new TestReader(options);
}

function getReaderOptions(options: Partial<ReaderOptions> = {}): ReaderOptions {
	return { ...options } as unknown as ReaderOptions;
}

describe('Readers → ReaderStream', () => {
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

			assert.ok(reader.walkStream.called);
		});
	});

	describe('.static', () => {
		it('should return entries', (done) => {
			const reader = getReader();
			const readerOptions = getReaderOptions({ entryFilter: () => true });

			reader.stat.onFirstCall().yields(null, new Stats());
			reader.stat.onSecondCall().yields(null, new Stats());

			const entries: Entry[] = [];

			const stream = reader.static(['a.txt', 'b.txt'], readerOptions);

			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('end', () => {
				assert.strictEqual(entries[0].name, 'a.txt');
				assert.strictEqual(entries[1].name, 'b.txt');
				done();
			});
		});

		it('should throw an error when the filter does not suppress the error', (done) => {
			const reader = getReader();
			const readerOptions = getReaderOptions({
				errorFilter: () => false,
				entryFilter: () => true,
			});

			reader.stat.onFirstCall().yields(tests.errno.getEperm());
			reader.stat.onSecondCall().yields(null, new Stats());

			const entries: Entry[] = [];

			const stream = reader.static(['a.txt', 'b.txt'], readerOptions);

			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('error', (error: ErrnoException) => {
				assert.strictEqual(error.code, 'EPERM');
				done();
			});
		});

		it('should do not throw an error when the filter suppress the error', (done) => {
			const reader = getReader();
			const readerOptions = getReaderOptions({
				errorFilter: () => true,
				entryFilter: () => true,
			});

			reader.stat.onFirstCall().yields(tests.errno.getEnoent());
			reader.stat.onSecondCall().yields(null, new Stats());

			const entries: Entry[] = [];

			const stream = reader.static(['a.txt', 'b.txt'], readerOptions);

			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('end', () => {
				assert.strictEqual(entries.length, 1);
				assert.strictEqual(entries[0].name, 'b.txt');
				done();
			});
		});

		it('should do not include entry when the filter excludes it', (done) => {
			const reader = getReader();
			const readerOptions = getReaderOptions({ entryFilter: () => false });

			reader.stat.yields(null, new Stats());

			const entries: Entry[] = [];

			const stream = reader.static(['a.txt'], readerOptions);

			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('end', () => {
				assert.strictEqual(entries.length, 0);
				done();
			});
		});
	});
});
