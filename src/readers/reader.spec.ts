import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

import { Stats } from '@nodelib/fs.macchiato';

import Settings, { Options } from '../settings';
import { Entry, Pattern } from '../types';
import Reader from './reader';

class FakeReader extends Reader<never[]> {
	constructor(_options: Options = {}) {
		super(new Settings(_options));
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

	public makeEntry(stats: fs.Stats, pattern: Pattern): Entry {
		return this._makeEntry(stats, pattern);
	}
}

describe('Readers → Reader', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = new FakeReader();

			assert.ok(reader instanceof FakeReader);
		});
	});

	describe('.getFullEntryPath', () => {
		it('should return path to entry', () => {
			const reader = new FakeReader();

			const expected = path.join(process.cwd(), 'config.json');

			const actual = reader.getFullEntryPath('config.json');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.makeEntry', () => {
		it('should return created entry', () => {
			const reader = new FakeReader();
			const pattern = 'config.json';

			const actual = reader.makeEntry(new Stats(), pattern);

			assert.strictEqual(actual.name, pattern);
			assert.strictEqual(actual.path, pattern);
			assert.ok(actual.dirent.isFile());
		});

		it('should return created entry with fs.Stats', () => {
			const reader = new FakeReader({ stats: true });
			const pattern = 'config.json';

			const actual = reader.makeEntry(new Stats(), pattern);

			assert.ok(actual.stats);
		});
	});
});
