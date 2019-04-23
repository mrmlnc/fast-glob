// tslint:disable max-classes-per-file

import * as assert from 'assert';

import { Task } from '../managers/tasks';
import Settings from '../settings';
import * as tests from '../tests/index';
import { Entry, EntryItem } from '../types/index';
import ReaderStream from './reader-stream';

class ReaderStreamFake extends ReaderStream {
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

class ReaderStreamFakeThrowEnoent extends ReaderStreamFake {
	public api(): NodeJS.ReadableStream {
		return this.fake('dynamic', new tests.EnoentErrnoException());
	}
}

class ReaderStreamFakeThrowErrno extends ReaderStreamFake {
	public api(): NodeJS.ReadableStream {
		return this.fake('dynamic', new Error('Boom'));
	}
}

/**
 * Wrapper for easily testing Stream API.
 */
const getEntries = (settings: Settings, task: Task, api: typeof ReaderStreamFake): Promise<EntryItem[]> => {
	return new Promise((resolve, reject) => {
		const entries: EntryItem[] = [];

		const reader = new api(settings);

		const stream = reader.read(task);

		stream.on('error', reject);
		stream.on('data', (entry: EntryItem) => entries.push(entry));
		stream.on('end', () => resolve(entries));
	});
};

function getTask(dynamic: boolean = true): Task {
	return {
		dynamic,
		base: 'fixtures',
		patterns: ['**/*'],
		positive: ['**/*'],
		negative: []
	};
}

describe('Providers → ReaderStream', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const settings = new Settings();
			const reader = new ReaderStream(settings);

			assert.ok(reader instanceof ReaderStream);
		});
	});

	describe('.read', () => {
		it('should returns entries for dynamic entries', async () => {
			const task = getTask();
			const settings = new Settings();

			const expected: string[] = ['dynamic'];

			const actual = await getEntries(settings, task, ReaderStreamFake);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries for static entries', async () => {
			const task = getTask(/* dynamic */ false);
			const settings = new Settings();

			const expected: string[] = ['static'];

			const actual = await getEntries(settings, task, ReaderStreamFake);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries (stats)', async () => {
			const task = getTask();
			const settings = new Settings({ stats: true });

			const expected: Entry[] = [{ path: 'dynamic' } as Entry];

			const actual = await getEntries(settings, task, ReaderStreamFake);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns transformed entries', async () => {
			const task = getTask();
			const settings = new Settings({ transform: () => 'cake' });

			const expected: string[] = ['cake'];

			const actual = await getEntries(settings, task, ReaderStreamFake);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns empty array if provided cwd does not exists', async () => {
			const task = getTask();
			const settings = new Settings();

			const expected: string[] = [];

			const actual = await getEntries(settings, task, ReaderStreamFakeThrowEnoent);

			assert.deepStrictEqual(actual, expected);
		});

		it('should throw error', async () => {
			const task = getTask();
			const settings = new Settings();

			try {
				await getEntries(settings, task, ReaderStreamFakeThrowErrno);

				throw new Error('Wow');
			} catch (err) {
				assert.strictEqual((err as Error).message, 'Boom');
			}
		});
	});
});
