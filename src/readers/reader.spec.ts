import * as assert from 'node:assert';
import * as path from 'node:path';
import * as process from 'node:process';
import { Stats, StatsMode } from '@nodelib/fs.macchiato';
import { describe, it } from 'mocha';
import Settings, { type Options } from '../settings.js';
import * as tests from '../tests/index.js';
import type {
	Entry,
	ErrnoException,
	FsStats,
	Pattern,
} from '../types/index.js';
import { Reader } from './reader.js';

class TestReader extends Reader<never[]> {
	constructor(options?: Options) {
		super(new Settings(options));
	}

	public dynamic(): never[] {
		return [];
	}

	public static(): never[] {
		return [];
	}

	public getFullEntryPath(filepath: string): string {
		return this._getFullEntryPath(filepath);
	}

	public makeEntry(stats: FsStats, pattern: Pattern): Entry {
		return this._makeEntry(stats, pattern);
	}

	public isFatalError(error: ErrnoException): boolean {
		return this._isFatalError(error);
	}
}

function getReader(options?: Options): TestReader {
	return new TestReader(options);
}

describe('Readers → Reader', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = getReader();

			assert.ok(reader instanceof TestReader);
		});
	});

	describe('.getFullEntryPath', () => {
		it('should return path to entry', () => {
			const reader = getReader();

			const expected = path.join(process.cwd(), 'config.json');

			const actual = reader.getFullEntryPath('config.json');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.makeEntry', () => {
		it('should return created entry', () => {
			const reader = getReader();
			const pattern = 'config.json';
			const stats = new Stats({ mode: StatsMode.File });

			const actual = reader.makeEntry(stats, pattern);

			assert.strictEqual(actual.name, pattern);
			assert.strictEqual(actual.path, pattern);
			assert.ok(actual.dirent.isFile());
		});

		it('should return created entry with fs.Stats', () => {
			const reader = getReader({ stats: true });
			const pattern = 'config.json';

			const actual = reader.makeEntry(new Stats(), pattern);

			assert.ok(actual.stats);
		});

		it('should return created entry with basename as `name` for a pattern with a directory part', () => {
			const reader = getReader();
			const pattern = './directory/config.json';
			const stats = new Stats({ mode: StatsMode.File });

			const actual = reader.makeEntry(stats, pattern);

			assert.strictEqual(actual.name, 'config.json');
			assert.strictEqual(actual.path, pattern);
			assert.strictEqual(actual.dirent.name, 'config.json');
		});
	});

	describe('.isFatalError', () => {
		it('should return false for ENOENT error', () => {
			const reader = getReader();

			assert.ok(!reader.isFatalError(tests.errno.getEnoent()));
		});

		it('should return true for EPERM error', () => {
			const reader = getReader();

			assert.ok(reader.isFatalError(tests.errno.getEperm()));
		});

		it('should return true for ENOENT error when the `errorFilter` option returns false', () => {
			const reader = getReader({ errorFilter: () => false });

			assert.ok(reader.isFatalError(tests.errno.getEnoent()));
		});

		it('should return false for EPERM error when the `errorFilter` option returns true', () => {
			const reader = getReader({ errorFilter: () => true });

			assert.ok(!reader.isFatalError(tests.errno.getEperm()));
		});
	});
});
