import * as assert from 'assert';

import { Task } from '../managers/tasks';
import Settings, { TransformFunction } from '../settings';
import * as tests from '../tests/index';
import { Entry } from '../types/index';
import ProviderSync from './sync';

class TestProviderSync extends ProviderSync {
	public dynamicApi(): Entry[] {
		return [{ path: 'dynamic' } as Entry];
	}

	public staticApi(): Entry[] {
		return [{ path: 'static' } as Entry];
	}
}

class TestProviderSyncWithEnoent extends TestProviderSync {
	public api(): never {
		throw new tests.EnoentErrnoException();
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
			const settings = new Settings();
			const provider = new ProviderSync(settings);

			assert.ok(provider instanceof ProviderSync);
		});
	});

	describe('.read', () => {
		it('should returns entries for dynamic task', () => {
			const task = getTask();
			const settings = new Settings();
			const provider = new TestProviderSync(settings);

			const expected: string[] = ['dynamic'];

			const actual = provider.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries for static task', () => {
			const task = getTask(/* dynamic */ false);
			const settings = new Settings();
			const provider = new TestProviderSync(settings);

			const expected: string[] = ['static'];

			const actual = provider.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns entries (stats)', () => {
			const task = getTask();
			const settings = new Settings({ stats: true });
			const provider = new TestProviderSync(settings);

			const expected: Entry[] = [{ path: 'dynamic' } as Entry];

			const actual = provider.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns transformed entries', () => {
			const transform: TransformFunction<string> = () => 'cake';

			const task = getTask();
			const settings = new Settings({ transform });
			const provider = new TestProviderSync(settings);

			const expected: string[] = ['cake'];

			const actual = provider.read(task);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns empty array if provided cwd does not exists', () => {
			const task = getTask();
			const settings = new Settings();

			const provider = new TestProviderSyncWithEnoent(settings);

			const expected: string[] = [];

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
