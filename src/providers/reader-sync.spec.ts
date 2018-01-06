import * as assert from 'assert';

import * as tests from '../tests/index';

import ReaderSync from './reader-sync';

import * as optionsManager from '../managers/options';

import { TTransformFunction } from '../managers/options';
import { ITask } from '../managers/tasks';
import { TEntry } from '../types/entries';

class ReaderSyncFake extends ReaderSync {
	public apiWithStat(): TEntry[] {
		return [{ path: 'fake' } as TEntry];
	}

	public api(): string[] {
		return ['fake'];
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

describe('Providers → ReaderSync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const options = optionsManager.prepare();
			const reader = new ReaderSync(options);

			assert.ok(reader instanceof ReaderSync);
		});
	});

	describe('.read', () => {
		const task: ITask = {
			base: 'fixtures',
			patterns: ['**/*'],
			positive: ['**/*'],
			negative: []
		};

		it('should returns entries', () => {
			const options = optionsManager.prepare();
			const reader = new ReaderSyncFake(options);

			const expected: string[] = ['fake'];

			const actual = reader.read(task);

			assert.deepEqual(actual, expected);
		});

		it('should returns entries (stats)', () => {
			const options = optionsManager.prepare({ stats: true });
			const reader = new ReaderSyncFake(options);

			const expected: TEntry[] = [{ path: 'fake' } as TEntry];

			const actual = reader.read(task);

			assert.deepEqual(actual, expected);
		});

		it('should returns transformed entries', () => {
			const transform: TTransformFunction<string> = () => 'cake';

			const options = optionsManager.prepare({ transform });
			const reader = new ReaderSyncFake(options);

			const expected: string[] = ['cake'];

			const actual = reader.read(task);

			assert.deepEqual(actual, expected);
		});

		it('should returns empty array if provided cwd does not exists', () => {
			const options = optionsManager.prepare();

			const reader = new ReaderSyncFakeThrowEnoent(options);

			const expected: string[] = [];

			const actual = reader.read(task);

			assert.deepEqual(actual, expected);
		});

		it('should throw error', () => {
			const options = optionsManager.prepare();
			const reader = new ReaderSyncFakeThrowErrno(options);

			assert.throws(() => reader.read(task), /Boom/);
		});
	});
});
