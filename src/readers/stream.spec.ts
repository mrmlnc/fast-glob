import * as assert from 'assert';
import { EventEmitter } from 'events';

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
	return { ...options } as ReaderOptions;
}

describe('Readers → ReaderStream', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = getReader();

			assert.ok(reader instanceof TestReader);
		});
	});

	describe('.dynamic', () => {
		it('should not re-throw ENOENT error', (done) => {
			const reader = getReader();
			const readerOptions = getReaderOptions();
			const emitter = new EventEmitter();

			reader.walkStream.returns(emitter);

			const stream = reader.dynamic('root', readerOptions);

			stream.once('end', done);

			emitter.emit('error', tests.errno.getEnoent());
			emitter.emit('end');
		});

		it('should not re-throw EPERM error when the `suppressErrors` option is enabled', (done) => {
			const reader = getReader({ suppressErrors: true });
			const readerOptions = getReaderOptions();
			const emitter = new EventEmitter();

			reader.walkStream.returns(emitter);

			const stream = reader.dynamic('root', readerOptions);

			stream.once('end', done);

			emitter.emit('error', tests.errno.getEperm());
			emitter.emit('end');
		});

		it('should re-throw non-ENOENT error', (done) => {
			const reader = getReader();
			const readerOptions = getReaderOptions();
			const emitter = new EventEmitter();

			reader.walkStream.returns(emitter);

			const stream = reader.dynamic('root', readerOptions);

			stream.once('error', (error: ErrnoException) => {
				assert.strictEqual(error.code, 'EPERM');
				done();
			});

			emitter.emit('error', tests.errno.getEperm());
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

		it('should not re-throw ENOENT error', (done) => {
			const reader = getReader();
			const readerOptions = getReaderOptions({ entryFilter: () => true });

			reader.stat.onFirstCall().yields(tests.errno.getEnoent());
			reader.stat.onSecondCall().yields(null, new Stats());

			const entries: Entry[] = [];

			const stream = reader.static(['a.txt', 'b.txt'], readerOptions);

			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('end', () => {
				assert.strictEqual(entries[0].name, 'b.txt');
				done();
			});
		});

		it('should not re-throw EPERM error when the `suppressErrors` option is enabled', (done) => {
			const reader = getReader({ suppressErrors: true });
			const readerOptions = getReaderOptions({ entryFilter: () => true });

			reader.stat.onFirstCall().yields(tests.errno.getEperm());
			reader.stat.onSecondCall().yields(null, new Stats());

			const entries: Entry[] = [];

			const stream = reader.static(['a.txt', 'b.txt'], readerOptions);

			stream.on('data', (entry: Entry) => entries.push(entry));
			stream.once('end', () => {
				assert.strictEqual(entries[0].name, 'b.txt');
				done();
			});
		});

		it('should re-throw non-ENOENT error', (done) => {
			const reader = getReader();
			const readerOptions = getReaderOptions();

			reader.stat.yields(tests.errno.getEperm());

			const stream = reader.static(['a.txt', 'b.txt'], readerOptions);

			stream.on('data', () => { /* nope */ });
			stream.once('error', (error: ErrnoException) => {
				assert.strictEqual(error.code, 'EPERM');
				done();
			});
		});

		it('should do not include entry when filter exclude it', (done) => {
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
