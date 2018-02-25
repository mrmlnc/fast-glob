import * as assert from 'assert';
import * as fs from 'fs';

import FileSystemSync from './fs-sync';

import * as optionsManager from '../managers/options';

import { Entry } from '../types/entries';
import { Pattern } from '../types/patterns';

/**
 * The options are not changed in these tests.
 */
const options = optionsManager.prepare();

class FileSystemSyncFake extends FileSystemSync {
	constructor(private readonly isSymbolicLink: boolean = true) {
		super(options);
	}

	/**
	 * Here «0» is an indicator that it is «lstat» call.
	 */
	public lstat(): fs.Stats {
		return getStats(0, this.isSymbolicLink);
	}

	/**
	 * Here «1» is an indicator that it is «stat» call.
	 */
	public stat(): fs.Stats {
		return getStats(1, this.isSymbolicLink);
	}
}

class FileSystemSyncThrowLStatError extends FileSystemSyncFake {
	private call: number = 0;

	/**
	 * First call throw error.
	 */
	public lstat(): fs.Stats | never {
		if (this.call === 0) {
			this.call++;

			throw new Error('Something');
		}

		return super.lstat();
	}
}

class FileSystemSyncThrowStatError extends FileSystemSyncFake {
	public stat(): never {
		throw new Error('Something');
	}
}

function getStats(uid: number, isSymbolicLink: boolean): fs.Stats {
	return { uid, isSymbolicLink: () => isSymbolicLink } as fs.Stats;
}

function getAdapter(isSymbolicLink: boolean = true): FileSystemSyncFake {
	return new FileSystemSyncFake(isSymbolicLink);
}

function getEntries(_adapter: new () => FileSystemSyncFake, positive: Pattern[], isSkippedEntry: boolean): string[] {
	const adapter = new _adapter();

	return adapter.read(positive, () => isSkippedEntry).map(({ path }) => path);
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

			const actual = getEntries(FileSystemSyncFake, ['pattern1', 'pattern2'], /* isSkippedEntry */ false);

			assert.deepEqual(actual, expected);
		});

		it('should return entries', () => {
			const expected = ['pattern1', 'pattern2'];

			const actual = getEntries(FileSystemSyncFake, ['pattern1', 'pattern2'], /* isSkippedEntry */ true);

			assert.deepEqual(actual, expected);
		});

		it('should return entries without null items', () => {
			const expected = ['pattern2'];

			const actual = getEntries(FileSystemSyncThrowLStatError, ['pattern1', 'pattern2'], /* isSkippedEntry */ true);

			assert.deepEqual(actual, expected);
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

			delete (actual as Entry).isSymbolicLink;

			assert.deepEqual(actual, expected);
		});

		it('should return null when lstat throw error', () => {
			const adapter = new FileSystemSyncThrowLStatError();

			const expected = null;

			const actual = adapter.getEntry('filepath', 'pattern');

			assert.equal(actual, expected);
		});
	});

	describe('.getStat', () => {
		it('should return stat', () => {
			const adapter = getAdapter();

			const expected: fs.Stats = { uid: 1 } as fs.Stats;

			const actual = adapter.getStat('pattern');

			delete actual.isSymbolicLink;

			assert.deepEqual(actual, expected);
		});

		it('should return only lstat when is not a symlink', () => {
			const adapter = getAdapter(/* isSymbolicLink */ false);

			const expected: fs.Stats = { uid: 0 } as fs.Stats;

			const actual = adapter.getStat('file.json');

			delete actual.isSymbolicLink;

			assert.deepEqual(actual, expected);
		});

		it('should return only lstat when stat call throw error', () => {
			const adapter = new FileSystemSyncThrowStatError();

			const expected: fs.Stats = { uid: 0 } as fs.Stats;

			const actual = adapter.getStat('file.json');

			delete actual.isSymbolicLink;

			assert.deepEqual(actual, expected);
		});
	});
});
