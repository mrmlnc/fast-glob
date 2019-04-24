import * as assert from 'assert';
import * as fs from 'fs';

import { Stats } from '@nodelib/fs.macchiato';

import Settings from '../settings';
import { Entry, Pattern } from '../types/index';
import FileSystemStream from './fs-stream';

class FileSystemStreamFake extends FileSystemStream {
	constructor() {
		super(new Settings());
	}

	public getStat(): Promise<fs.Stats> {
		return Promise.resolve(new Stats());
	}
}

class FileSystemStreamThrowStatError extends FileSystemStreamFake {
	private _call: number = 0;

	public getStat(): Promise<fs.Stats> {
		if (this._call === 0) {
			this._call++;

			return Promise.reject(new Error('something'));
		}

		return Promise.resolve(new Stats());
	}
}

function getAdapter(): FileSystemStreamFake {
	return new FileSystemStreamFake();
}

function getEntries(_adapter: new () => FileSystemStreamFake, positive: Pattern[], isFollowedEntry: boolean): Promise<string[]> {
	const adapter = new _adapter();

	const entries: string[] = [];

	return new Promise((resolve, reject) => {
		const stream = adapter.read(positive, () => isFollowedEntry);

		stream.on('data', (entry: Entry) => entries.push(entry.path));

		stream.on('error', reject);
		stream.on('end', () => resolve(entries));
	});
}

describe('Adapters → FileSystemStream', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const adapter = getAdapter();

			assert.ok(adapter instanceof FileSystemStream);
		});
	});

	describe('.read', () => {
		it('should return empty array', async () => {
			const expected: string[] = [];

			const actual = await getEntries(FileSystemStreamFake, ['pattern1', 'pattern2'], /* isFollowedEntry */ false);

			assert.deepStrictEqual(actual, expected);
		});

		it('should return entries', async () => {
			const expected = ['pattern1', 'pattern2'];

			const actual = await getEntries(FileSystemStreamFake, ['pattern1', 'pattern2'], /* isFollowedEntry */ true);

			assert.deepStrictEqual(actual, expected);
		});

		it('should return entries without null items', async () => {
			const expected = ['pattern2'];

			const actual = await getEntries(FileSystemStreamThrowStatError, ['pattern1', 'pattern2'], /* isFollowedEntry */ true);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.getEntry', () => {
		it('should return created entry', async () => {
			const adapter = getAdapter();

			const actual = await adapter.getEntry('filepath', 'pattern');

			assert.strictEqual((actual as Entry).name, 'pattern');
			assert.strictEqual((actual as Entry).path, 'pattern');
		});

		it('should return null when lstat throw error', async () => {
			const adapter = new FileSystemStreamThrowStatError();

			const expected = null;

			const actual = await adapter.getEntry('filepath', 'pattern');

			assert.strictEqual(actual, expected);
		});
	});
});
