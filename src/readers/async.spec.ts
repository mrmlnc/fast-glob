import * as assert from 'assert';
import { PassThrough } from 'stream';

import * as sinon from 'sinon';

import Settings from '../settings';
import * as tests from '../tests';
import { ReaderAsync } from './async';
import { ReaderStream } from './stream';

import type { ReaderOptions } from '../types';
import type { Options } from '../settings';
import type * as fsWalk from '@nodelib/fs.walk';

type WalkSignature = typeof fsWalk.walk;

class TestReader extends ReaderAsync {
	protected override _walkAsync: WalkSignature = sinon.stub() as unknown as WalkSignature;
	protected override _readerStream: ReaderStream = sinon.createStubInstance(ReaderStream) as unknown as ReaderStream;

	constructor(options?: Options) {
		super(new Settings(options));
	}

	public get walkAsync(): sinon.SinonStub {
		return this._walkAsync as unknown as sinon.SinonStub;
	}

	public get readerStream(): sinon.SinonStubbedInstance<ReaderStream> {
		return this._readerStream as unknown as sinon.SinonStubbedInstance<ReaderStream>;
	}
}

function getReader(options?: Options): TestReader {
	return new TestReader(options);
}

function getReaderOptions(options: Partial<ReaderOptions> = {}): ReaderOptions {
	return { ...options } as unknown as ReaderOptions;
}

describe('Readers → ReaderAsync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = getReader();

			assert.ok(reader instanceof TestReader);
		});
	});

	describe('.dynamic', () => {
		it('should call fs.walk method', async () => {
			const reader = getReader();
			const readerOptions = getReaderOptions();

			reader.walkAsync.yields(null, []);

			await reader.dynamic('root', readerOptions);

			assert.ok(reader.walkAsync.called);
		});
	});

	describe('.static', () => {
		it('should call stream reader method', async () => {
			const entry = tests.entry.builder().path('root/file.txt').build();

			const reader = getReader();
			const readerOptions = getReaderOptions();
			const readerStream = new PassThrough({ objectMode: true });

			readerStream.push(entry);
			readerStream.push(null);

			reader.readerStream.static.returns(readerStream);

			await reader.static(['a.txt'], readerOptions);

			assert.ok(reader.readerStream.static.called);
		});
	});
});
