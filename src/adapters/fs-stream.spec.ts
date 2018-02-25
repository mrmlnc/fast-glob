import * as assert from 'assert';
import * as fs from 'fs';

import FileSystemStream from './fs-stream';

import * as optionsManager from '../managers/options';

import { Entry } from '../types/entries';
import { Pattern } from '../types/patterns';

/**
 * The options are not changed in these tests.
 */
const options = optionsManager.prepare();

class FileSystemStreamFake extends FileSystemStream {
	constructor(private readonly isSymbolicLink: boolean = true) {
		super(options);
	}

	/**
	 * Here «0» is an indicator that it is «lstat» call.
	 */
	public lstat(): Promise<fs.Stats> {
		return getStats(0, this.isSymbolicLink);
	}

	/**
	 * Here «1» is an indicator that it is «stat» call.
	 */
	public stat(): Promise<fs.Stats> {
		return getStats(1, this.isSymbolicLink);
	}
}

class FileSystemStreamThrowLStatError extends FileSystemStreamFake {
	private call: number = 0;

	/**
	 * First call throw error.
	 */
	public lstat(): Promise<fs.Stats> {
		if (this.call === 0) {
			this.call++;

			return Promise.reject(new Error('something'));
		}

		return super.lstat();
	}
}

class FileSystemStreamThrowStatError extends FileSystemStreamFake {
	public stat(): Promise<fs.Stats> {
		return Promise.reject(new Error('something'));
	}
}

function getStats(uid: number, isSymbolicLink: boolean): Promise<fs.Stats> {
	return Promise.resolve({ uid, isSymbolicLink: () => isSymbolicLink } as fs.Stats);
}

function getAdapter(isSymbolicLink: boolean = true): FileSystemStreamFake {
	return new FileSystemStreamFake(isSymbolicLink);
}

function getEntries(_adapter: new () => FileSystemStreamFake, positive: Pattern[], isSkippedEntry: boolean): Promise<string[]> {
	const adapter = new _adapter();

	const entries: string[] = [];

	return new Promise((resolve, reject) => {
		const stream = adapter.read(positive, () => isSkippedEntry);

		stream.on('data', (entry: Entry) => entries.push(entry.path));

		stream.on('error', reject);
		stream.on('end', () => resolve(entries));
	});
}

describe('Adapters → FileSystemSync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const adapter = getAdapter();

			assert.ok(adapter instanceof FileSystemStream);
		});
	});

	describe('.read', () => {
		it('should return empty array', async () => {
			const expected: string[] = [];

			const actual = await getEntries(FileSystemStreamFake, ['pattern1', 'pattern2'], /* isSkippedEntry */ false);

			assert.deepEqual(actual, expected);
		});

		it('should return entries', async () => {
			const expected = ['pattern1', 'pattern2'];

			const actual = await getEntries(FileSystemStreamFake, ['pattern1', 'pattern2'], /* isSkippedEntry */ true);

			assert.deepEqual(actual, expected);
		});

		it('should return entries without null items', async () => {
			const expected = ['pattern2'];

			const actual = await getEntries(FileSystemStreamThrowLStatError, ['pattern1', 'pattern2'], /* isSkippedEntry */ true);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.getEntry', () => {
		it('should return created entry', async () => {
			const adapter = getAdapter();

			const expected: Entry = {
				path: 'pattern',
				depth: 1,
				uid: 1
			} as Entry;

			const actual = await adapter.getEntry('filepath', 'pattern');

			delete (actual as Entry).isSymbolicLink;

			assert.deepEqual(actual, expected);
		});

		it('should return null when lstat throw error', async () => {
			const adapter = new FileSystemStreamThrowLStatError();

			const expected = null;

			const actual = await adapter.getEntry('filepath', 'pattern');

			assert.equal(actual, expected);
		});
	});

	describe('.getStat', () => {
		it('should return stat', async () => {
			const adapter = getAdapter();

			const expected: fs.Stats = { uid: 1 } as fs.Stats;

			const actual = await adapter.getStat('pattern');

			delete actual.isSymbolicLink;

			assert.deepEqual(actual, expected);
		});

		it('should return only lstat when is not a symlink', async () => {
			const adapter = getAdapter(/* isSymbolicLink */ false);

			const expected: fs.Stats = { uid: 0 } as fs.Stats;

			const actual = await adapter.getStat('file.json');

			delete actual.isSymbolicLink;

			assert.deepEqual(actual, expected);
		});

		it('should return only lstat when stat call throw error', async () => {
			const adapter = new FileSystemStreamThrowStatError();

			const expected: fs.Stats = { uid: 0 } as fs.Stats;

			const actual = await adapter.getStat('file.json');

			delete actual.isSymbolicLink;

			assert.deepEqual(actual, expected);
		});
	});
});
