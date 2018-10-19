import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

import FileSystem from './fs';

import * as optionsManager from '../managers/options';

import { Entry } from '../types/entries';

class FileSystemFake extends FileSystem<never[]> {
	public read(_filepaths: string[]): never[] {
		return [];
	}
}

function getAdapter(): FileSystemFake {
	const options = optionsManager.prepare();

	return new FileSystemFake(options);
}

describe('Adapters → FileSystem', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const adapter = getAdapter();

			assert.ok(adapter instanceof FileSystem);
		});
	});

	describe('.read', () => {
		it('should return empty array', () => {
			const adapter = getAdapter();

			const expected: never[] = [];

			const actual = adapter.read([]);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.getFullEntryPath', () => {
		it('should return path to entry', () => {
			const adapter = getAdapter();

			const expected = path.join(process.cwd(), 'config.json');

			const actual = adapter.getFullEntryPath('config.json');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.makeEntry', () => {
		it('should return created entry', () => {
			const adapter = getAdapter();

			const expected = {
				path: 'base/file.json',
				depth: 2
			} as Entry;

			const actual = adapter.makeEntry({} as fs.Stats, 'base/file.json');

			assert.deepStrictEqual(actual, expected);
		});
	});
});
