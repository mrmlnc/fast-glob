import * as assert from 'assert';

import * as manager from './options';

function getOptions(options?: manager.IPartialOptions): manager.IOptions {
	return Object.assign<manager.IOptions, manager.IPartialOptions | undefined>({
		cwd: process.cwd(),
		deep: true,
		ignore: [],
		dot: false,
		stats: false,
		onlyFiles: true,
		onlyDirectories: false,
		followSymlinkedDirectories: true,
		unique: true,
		markDirectories: false,
		absolute: false,
		nobrace: false,
		noglobstar: false,
		noext: false,
		nocase: false,
		matchBase: false,
		transform: null
	}, options);
}

describe('Managers → Options', () => {
	describe('.prepare', () => {
		it('should returns prepared options for empty object', () => {
			const expected: manager.IOptions = getOptions();

			const actual = manager.prepare();

			assert.deepEqual(actual, expected);
		});

		it('should returns prepared options for provided object', () => {
			const expected: manager.IOptions = getOptions({ stats: true });

			const actual = manager.prepare({ stats: true });

			assert.deepEqual(actual, expected);
		});

		it('should disable the «onlyFiles» option if «onlyDirectories» option is enabled', () => {
			const expected: manager.IOptions = getOptions({
				onlyFiles: false,
				onlyDirectories: true
			});

			const actual = manager.prepare({ onlyDirectories: true });

			assert.deepEqual(actual, expected);
		});
	});
});
