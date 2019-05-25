import * as assert from 'assert';
import * as path from 'path';

import { Stats } from '@nodelib/fs.macchiato';

import Settings from '../settings';
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

			const filepath = path.join('base', 'file.json');
			const actual = adapter.makeEntry(new Stats(), filepath);

			assert.strictEqual(actual.path, filepath);
			assert.ok(actual.dirent.isFile());
		});
	});
});
