import * as assert from 'assert';
import * as fs from 'fs';

import Settings from '../settings';
import { Entry } from '../types/entries';
import { Pattern } from '../types/patterns';
import FileSystemSync from './fs-sync';

class FileSystemSyncFake extends FileSystemSync {
	constructor() {
		super(new Settings());
	}

	public getStat(): fs.Stats {
		return getStats(1);
	}
}

class FileSystemSyncThrowStatError extends FileSystemSyncFake {
	private call: number = 0;

	/**
	 * First call throw error.
	 */
	public getStat(): fs.Stats | never {
		if (this.call === 0) {
			this.call++;

			throw new Error('Something');
		}

		return getStats(1);
	}
}

function getStats(uid: number): fs.Stats {
	return { uid } as fs.Stats;
}

function getAdapter(): FileSystemSyncFake {
	return new FileSystemSyncFake();
}

function getEntries(_adapter: new () => FileSystemSyncFake, positive: Pattern[], isFollowedEntry: boolean): string[] {
	const adapter = new _adapter();

	return adapter.read(positive, () => isFollowedEntry).map(({ path }) => path);
}

describe('Adapters → FileSystemSync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const adapter = getAdapter();

			assert.ok(adapter instanceof FileSystemSync);
		});
	});

	describe('.read', () => {
		it('should return empty array', () => {
			const expected: string[] = [];

			const actual = getEntries(FileSystemSyncFake, ['pattern1', 'pattern2'], /* isFollowedEntry */ false);

			assert.deepStrictEqual(actual, expected);
		});

		it('should return entries', () => {
			const expected = ['pattern1', 'pattern2'];

			const actual = getEntries(FileSystemSyncFake, ['pattern1', 'pattern2'], /* isFollowedEntry */ true);

			assert.deepStrictEqual(actual, expected);
		});

		it('should return entries without null items', () => {
			const expected = ['pattern2'];

			const actual = getEntries(FileSystemSyncThrowStatError, ['pattern1', 'pattern2'], /* isFollowedEntry */ true);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.getEntry', () => {
		it('should return created entry', () => {
			const adapter = getAdapter();

			const expected: Entry = {
				path: 'pattern',
				depth: 1,
				uid: 1
			} as Entry;

			const actual = adapter.getEntry('filepath', 'pattern');

			assert.deepStrictEqual(actual, expected);
		});

		it('should return null when lstat throw error', () => {
			const adapter = new FileSystemSyncThrowStatError();

			const expected = null;

			const actual = adapter.getEntry('filepath', 'pattern');

			assert.strictEqual(actual, expected);
		});
	});
});
