import * as assert from 'node:assert';
import * as path from 'node:path';

import { Stats, StatsMode } from '@nodelib/fs.macchiato';
import { describe, it } from 'mocha';

import Settings from '../settings';
import { Reader } from './reader';

import type { Options } from '../settings';
import type { Entry, FsStats, Pattern } from '../types';

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
	});
});
