// tslint:disable max-classes-per-file

import * as assert from 'assert';

import { Task } from '../managers/tasks';
import ReaderSync from '../readers/sync';
import Settings, { TransformFunction } from '../settings';
import { Entry } from '../types/index';
import ProviderSync from './sync';

class TestReaderSync extends ReaderSync {
	public dynamic(): Entry[] {
		return [{ path: 'dynamic' } as Entry];
	}

	public static(): Entry[] {
		return [{ path: 'static' } as Entry];
	}
}

class TestProviderSync extends ProviderSync {
	protected readonly _reader: ReaderSync = new TestReaderSync(this._settings);

	constructor(protected _settings: Settings = new Settings()) {
		super(_settings);
	}
}

class TestProviderSyncWithErrno extends TestProviderSync {
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

describe('Providers → ProviderSync', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const provider = new TestProviderSync();

			assert.ok(provider instanceof ProviderSync);
		});
	});

	describe('.read', () => {
		it('should returns entries for dynamic task', () => {
			const task = getTask();
			const provider = new TestProviderSync();

			const expected = ['dynamic'];

			const actual = provider.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries for static task', () => {
			const task = getTask(/* dynamic */ false);
			const provider = new TestProviderSync();

			const expected = ['static'];

			const actual = provider.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries (stats)', () => {
			const task = getTask();
			const settings = new Settings({ stats: true });
			const provider = new TestProviderSync(settings);

			const expected = [{ path: 'dynamic' } as Entry];

			const actual = provider.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns transformed entries', () => {
			const transform: TransformFunction<string> = () => 'cake';

			const task = getTask();
			const settings = new Settings({ transform });
			const provider = new TestProviderSync(settings);

			const expected = ['cake'];

			const actual = provider.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should throw error', () => {
			const task = getTask();
			const settings = new Settings();
			const provider = new TestProviderSyncWithErrno(settings);

			assert.throws(() => provider.read(task), /Boom/);
		});
	});
});
