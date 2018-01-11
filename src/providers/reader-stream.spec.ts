// tslint:disable max-classes-per-file

import * as assert from 'assert';

import * as tests from '../tests/index';

import ReaderStream from './reader-stream';

import * as optionsManager from '../managers/options';

import { IOptions } from '../managers/options';
import { ITask } from '../managers/tasks';
import { Entry, EntryItem } from '../types/entries';

class ReaderStreamFake extends ReaderStream {
	public apiWithStat(): NodeJS.ReadableStream {
		return this.fake({ path: 'fake' } as Entry);
	}

	public api(): NodeJS.ReadableStream {
		return this.fake('fake');
	}

	public fake(value: EntryItem, error?: Error | null): NodeJS.ReadableStream {
		return new tests.FakeStream(value, error ? error : null, { encoding: 'utf-8', objectMode: true });
	}
}

class ReaderStreamFakeThrowEnoent extends ReaderStreamFake {
	public api(): NodeJS.ReadableStream {
		return this.fake('fake', new tests.EnoentErrnoException());
	}
}

class ReaderStreamFakeThrowErrno extends ReaderStreamFake {
	public api(): NodeJS.ReadableStream {
		return this.fake('fake', new Error('Boom'));
	}
}

/**
 * Wrapper for easily testing Stream API.
 */
const getEntries = (options: IOptions, task: ITask, api: typeof ReaderStreamFake): Promise<EntryItem[]> => {
	return new Promise((resolve, reject) => {
		const entries: EntryItem[] = [];

		const reader = new api(options);

		const stream = reader.read(task);

		stream.on('error', reject);
		stream.on('data', (entry: EntryItem) => entries.push(entry));
		stream.on('end', () => resolve(entries));
	});
};

describe('Providers → ReaderStream', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const options = optionsManager.prepare();
			const reader = new ReaderStream(options);

			assert.ok(reader instanceof ReaderStream);
		});
	});

	describe('.read', () => {
		const task: ITask = {
			base: 'fixtures',
			patterns: ['**/*'],
			positive: ['**/*'],
			negative: []
		};

		it('should returns entries', async () => {
			const options = optionsManager.prepare();

			const expected: string[] = ['fake'];

			const actual = await getEntries(options, task, ReaderStreamFake);

			assert.deepEqual(actual, expected);
		});

		it('should returns entries (stats)', async () => {
			const options = optionsManager.prepare({ stats: true });

			const expected: Entry[] = [{ path: 'fake' } as Entry];

			const actual = await getEntries(options, task, ReaderStreamFake);

			assert.deepEqual(actual, expected);
		});

		it('should returns transformed entries', async () => {
			const options = optionsManager.prepare({ transform: () => 'cake' });

			const expected: string[] = ['cake'];

			const actual = await getEntries(options, task, ReaderStreamFake);

			assert.deepEqual(actual, expected);
		});

		it('should returns empty array if provided cwd does not exists', async () => {
			const options = optionsManager.prepare();

			const expected: string[] = [];

			const actual = await getEntries(options, task, ReaderStreamFakeThrowEnoent);

			assert.deepEqual(actual, expected);
		});

		it('should throw error', async () => {
			const options = optionsManager.prepare();

			try {
				await getEntries(options, task, ReaderStreamFakeThrowErrno);

				throw new Error('Wow');
			} catch (err) {
				assert.equal(err, 'Error: Boom');
			}
		});
	});
});
