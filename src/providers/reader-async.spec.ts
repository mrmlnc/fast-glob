// tslint:disable max-classes-per-file

import * as assert from 'assert';

import * as tests from '../tests/index';

import ReaderAsync from './reader-async';

import * as optionsManager from '../managers/options';

import { ITask } from '../managers/tasks';
import { Entry, EntryItem } from '../types/entries';

class ReaderAsyncFake extends ReaderAsync {
	public api(): NodeJS.ReadableStream {
		return this.fake({ path: 'fake' } as Entry);
	}

	public fake(value: EntryItem, error?: Error | null): NodeJS.ReadableStream {
		return new tests.FakeStream(value, error ? error : null, { encoding: 'utf-8', objectMode: true });
	}
}

class ReaderAsyncFakeThrowEnoent extends ReaderAsyncFake {
	public api(): NodeJS.ReadableStream {
		return this.fake('fake', new tests.EnoentErrnoException());
	}
}

class ReaderAsyncFakeThrowErrno extends ReaderAsyncFake {
	public api(): NodeJS.ReadableStream {
		return this.fake('fake', new Error('Boom'));
	}
}

describe('Providers → ReaderAsync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const options = optionsManager.prepare();
			const reader = new ReaderAsync(options);

			assert.ok(reader instanceof ReaderAsync);
		});
	});

	describe('.read', () => {
		const task: ITask = {
			base: 'fixtures',
			recursive: true,
			patterns: ['**/*'],
			positive: ['**/*'],
			negative: []
		};

		it('should returns entries', async () => {
			const options = optionsManager.prepare();
			const reader = new ReaderAsyncFake(options);

			const expected: string[] = ['fake'];

			const actual = await reader.read(task);

			assert.deepEqual(actual, expected);
		});

		it('should returns entries (stats)', async () => {
			const options = optionsManager.prepare({ stats: true });
			const reader = new ReaderAsyncFake(options);

			const expected: Entry[] = [{ path: 'fake' } as Entry];

			const actual = await reader.read(task);

			assert.deepEqual(actual, expected);
		});

		it('should returns transformed entries', async () => {
			const options = optionsManager.prepare({ transform: () => 'cake' });
			const reader = new ReaderAsyncFake(options);

			const expected: string[] = ['cake'];

			const actual = await reader.read(task);

			assert.deepEqual(actual, expected);
		});

		it('should returns empty array if provided cwd does not exists', async () => {
			const options = optionsManager.prepare();
			const reader = new ReaderAsyncFakeThrowEnoent(options);

			const expected: string[] = [];

			const actual = await reader.read(task);

			assert.deepEqual(actual, expected);
		});

		it('should throw error', async () => {
			const options = optionsManager.prepare();
			const reader = new ReaderAsyncFakeThrowErrno(options);

			try {
				await reader.read(task);

				throw new Error('Wow');
			} catch (err) {
				assert.equal(err, 'Error: Boom');
			}
		});
	});
});
