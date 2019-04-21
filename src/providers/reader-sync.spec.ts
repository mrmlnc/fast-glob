import * as assert from 'assert';

import { Task } from '../managers/tasks';
import Settings, { TransformFunction } from '../settings';
import * as tests from '../tests/index';
import { Entry } from '../types/entries';
import ReaderSync from './reader-sync';

class ReaderSyncFake extends ReaderSync {
	public dynamicApi(): Entry[] {
		return [{ path: 'dynamic' } as Entry];
	}

	public staticApi(): Entry[] {
		return [{ path: 'static' } as Entry];
	}
}

class ReaderSyncFakeThrowEnoent extends ReaderSyncFake {
	public api(): never {
		throw new tests.EnoentErrnoException();
	}
}

class ReaderSyncFakeThrowErrno extends ReaderSyncFake {
	public api(): never {
		throw new Error('Boom');
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

describe('Providers → ReaderSync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const settings = new Settings();
			const reader = new ReaderSync(settings);

			assert.ok(reader instanceof ReaderSync);
		});
	});

	describe('.read', () => {
		it('should returns entries for dynamic task', () => {
			const task = getTask();
			const settings = new Settings();
			const reader = new ReaderSyncFake(settings);

			const expected: string[] = ['dynamic'];

			const actual = reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries for static task', () => {
			const task = getTask(/* dynamic */ false);
			const settings = new Settings();
			const reader = new ReaderSyncFake(settings);

			const expected: string[] = ['static'];

			const actual = reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries (stats)', () => {
			const task = getTask();
			const settings = new Settings({ stats: true });
			const reader = new ReaderSyncFake(settings);

			const expected: Entry[] = [{ path: 'dynamic' } as Entry];

			const actual = reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns transformed entries', () => {
			const transform: TransformFunction<string> = () => 'cake';

			const task = getTask();
			const settings = new Settings({ transform });
			const reader = new ReaderSyncFake(settings);

			const expected: string[] = ['cake'];

			const actual = reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns empty array if provided cwd does not exists', () => {
			const task = getTask();
			const settings = new Settings();

			const reader = new ReaderSyncFakeThrowEnoent(settings);

			const expected: string[] = [];

			const actual = reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should throw error', () => {
			const task = getTask();
			const settings = new Settings();
			const reader = new ReaderSyncFakeThrowErrno(settings);

			assert.throws(() => reader.read(task), /Boom/);
		});
	});
});
