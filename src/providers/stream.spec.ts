// tslint:disable max-classes-per-file

import * as assert from 'assert';

import { Task } from '../managers/tasks';
import ReaderStream from '../readers/stream';
import Settings from '../settings';
import * as tests from '../tests/index';
import { Entry, EntryItem } from '../types/index';
import ProviderStream from './stream';

class TestReaderStream extends ReaderStream {
	public dynamic(): NodeJS.ReadableStream {
		return this.fake({ path: 'dynamic' } as Entry);
	}

	public static(): NodeJS.ReadableStream {
		return this.fake({ path: 'static' } as Entry);
	}

	public fake(value: EntryItem, error?: Error | null): NodeJS.ReadableStream {
		return new tests.FakeStream(value, error ? error : null, { encoding: 'utf-8', objectMode: true });
	}
}

class TestProviderStream extends ProviderStream {
	protected readonly _reader: TestReaderStream = new TestReaderStream(this._settings);

	constructor(protected _settings: Settings = new Settings()) {
		super(_settings);
	}
}

class TestProviderWithErrno extends TestProviderStream {
	public api(): NodeJS.ReadableStream {
		return this._reader.fake('dynamic', new Error('Boom'));
	}
}

/**
 * Wrapper for easily testing Stream API.
 */
const getEntries = (settings: Settings, task: Task, api: typeof TestProviderStream): Promise<EntryItem[]> => {
	return new Promise((resolve, reject) => {
		const entries: EntryItem[] = [];

		const provider = new api(settings);

		const stream = provider.read(task);

		stream.on('data', (entry: EntryItem) => entries.push(entry));
		stream.once('error', reject);
		stream.once('end', () => resolve(entries));
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

describe('Providers → ProviderStream', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const provider = new TestProviderStream();

			assert.ok(provider instanceof ProviderStream);
		});
	});

	describe('.read', () => {
		it('should returns entries for dynamic entries', async () => {
			const task = getTask();
			const settings = new Settings();

			const expected = ['dynamic'];

			const actual = await getEntries(settings, task, TestProviderStream);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries for static entries', async () => {
			const task = getTask(/* dynamic */ false);
			const settings = new Settings();

			const expected = ['static'];

			const actual = await getEntries(settings, task, TestProviderStream);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries (stats)', async () => {
			const task = getTask();
			const settings = new Settings({ stats: true });

			const expected = [{ path: 'dynamic' } as Entry];

			const actual = await getEntries(settings, task, TestProviderStream);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns transformed entries', async () => {
			const task = getTask();
			const settings = new Settings({ transform: () => 'cake' });

			const expected = ['cake'];

			const actual = await getEntries(settings, task, TestProviderStream);

			assert.deepStrictEqual(actual, expected);
		});

		it('should throw error', async () => {
			const task = getTask();
			const settings = new Settings();

			try {
				await getEntries(settings, task, TestProviderWithErrno);

				throw new Error('Wow');
			} catch (err) {
				assert.strictEqual((err as Error).message, 'Boom');
			}
		});
	});
});
