import * as assert from 'assert';

import * as tests from '../tests/index';

import ReaderSync from './reader-sync';

import * as optionsManager from '../managers/options';

import { TransformFunction } from '../managers/options';
import { ITask } from '../managers/tasks';
import { Entry } from '../types/entries';

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

function getTask(dynamic: boolean = true): ITask {
	return {
		base: 'fixtures',
		dynamic,
		patterns: ['**/*'],
		positive: ['**/*'],
		negative: []
	};
}

describe('Providers → ReaderSync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const options = optionsManager.prepare();
			const reader = new ReaderSync(options);

			assert.ok(reader instanceof ReaderSync);
		});
	});

	describe('.read', () => {
		it('should returns entries for dynamic task', () => {
			const task = getTask();
			const options = optionsManager.prepare();
			const reader = new ReaderSyncFake(options);

			const expected: string[] = ['dynamic'];

			const actual = reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries for static task', () => {
			const task = getTask(/* dynamic */ false);
			const options = optionsManager.prepare();
			const reader = new ReaderSyncFake(options);

			const expected: string[] = ['static'];

			const actual = reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries (stats)', () => {
			const task = getTask();
			const options = optionsManager.prepare({ stats: true });
			const reader = new ReaderSyncFake(options);

			const expected: Entry[] = [{ path: 'dynamic' } as Entry];

			const actual = reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns transformed entries', () => {
			const transform: TransformFunction<string> = () => 'cake';

			const task = getTask();
			const options = optionsManager.prepare({ transform });
			const reader = new ReaderSyncFake(options);

			const expected: string[] = ['cake'];

			const actual = reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns empty array if provided cwd does not exists', () => {
			const task = getTask();
			const options = optionsManager.prepare();

			const reader = new ReaderSyncFakeThrowEnoent(options);

			const expected: string[] = [];

			const actual = reader.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should throw error', () => {
			const task = getTask();
			const options = optionsManager.prepare();
			const reader = new ReaderSyncFakeThrowErrno(options);

			assert.throws(() => reader.read(task), /Boom/);
		});
	});
});
