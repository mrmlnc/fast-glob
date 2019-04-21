// tslint:disable max-classes-per-file

import * as assert from 'assert';

import { Task } from '../managers/tasks';
import Settings from '../settings';
import * as tests from '../tests/index';
import { Entry, EntryItem } from '../types/entries';
import ReaderAsync from './reader-async';

class ReaderAsyncFake extends ReaderAsync {
	public dynamicApi(): NodeJS.ReadableStream {
		return this.fake({ path: 'dynamic' } as Entry);
	}

	public staticApi(): NodeJS.ReadableStream {
		return this.fake({ path: 'static' } as Entry);
	}

	public fake(value: EntryItem, error?: Error | null): NodeJS.ReadableStream {
		return new tests.FakeStream(value, error ? error : null, { encoding: 'utf-8', objectMode: true });
	}
}

class ReaderAsyncFakeThrowEnoent extends ReaderAsyncFake {
	public api(): NodeJS.ReadableStream {
		return this.fake('dynamic', new tests.EnoentErrnoException());
	}
}

class ReaderAsyncFakeThrowErrno extends ReaderAsyncFake {
	public api(): NodeJS.ReadableStream {
		return this.fake('dynamic', new Error('Boom'));
	}
}

function getTask(dynamic: boolean = true): Task {
	return {
		dynamic,
		base: 'fixtures',
		patterns: ['**/*'],
		positive: ['**/*'],
		negative: []
	};
}

describe('Providers → ReaderAsync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const settings = new Settings();
			const reader = new ReaderAsync(settings);

			assert.ok(reader instanceof ReaderAsync);
		});
	});

	describe('.read', () => {
		it('should returns entries for dynamic task', async () => {
			const task = getTask();
			const settings = new Settings();
			const reader = new ReaderAsyncFake(settings);

			const expected: string[] = ['dynamic'];

			const actual = await reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries for static task', async () => {
			const task = getTask(/* dynamic */ false);
			const settings = new Settings();
			const reader = new ReaderAsyncFake(settings);

			const expected: string[] = ['static'];

			const actual = await reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries (stats)', async () => {
			const task = getTask();
			const settings = new Settings({ stats: true });
			const reader = new ReaderAsyncFake(settings);

			const expected: Entry[] = [{ path: 'dynamic' } as Entry];

			const actual = await reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns transformed entries', async () => {
			const task = getTask();
			const settings = new Settings({ transform: () => 'cake' });
			const reader = new ReaderAsyncFake(settings);

			const expected: string[] = ['cake'];

			const actual = await reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns empty array if provided cwd does not exists', async () => {
			const task = getTask();
			const settings = new Settings();
			const reader = new ReaderAsyncFakeThrowEnoent(settings);

			const expected: string[] = [];

			const actual = await reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should throw error', async () => {
			const task = getTask();
			const settings = new Settings();
			const reader = new ReaderAsyncFakeThrowErrno(settings);

			try {
				await reader.read(task);

				throw new Error('Wow');
			} catch (err) {
				assert.strictEqual((err as Error).message, 'Boom');
			}
		});
	});
});
