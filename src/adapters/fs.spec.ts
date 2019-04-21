import * as assert from 'assert';
import * as path from 'path';

import Settings from '../settings';
import * as tests from '../tests/index';
import FileSystem from './fs';

class FileSystemFake extends FileSystem<never[]> {
	public read(_filepaths: string[]): never[] {
		return [];
	}
}

function getAdapter(): FileSystemFake {
	return new FileSystemFake(new Settings());
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

			const actual = adapter.makeEntry(tests.getFileEntry(), 'base/file.json');

			assert.strictEqual(actual.path, 'base/file.json');
			assert.strictEqual(actual.depth, 2);
		});

		it('issue-144: should return entry with methods from fs.Stats', () => {
			const adapter = getAdapter();

			const actual = adapter.makeEntry(tests.getFileEntry(), 'file.json');

			assert.ok(actual.isFile());
		});
	});
});
