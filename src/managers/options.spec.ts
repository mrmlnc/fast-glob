import * as assert from 'assert';

import * as manager from './options';

describe('Managers → Options', () => {
	describe('.build', () => {
		it('should returns builded options for empty object', () => {
			const expected: manager.IOptions = {
				cwd: process.cwd(),
				deep: true,
				ignore: [],
				dot: false,
				stats: false,
				onlyFiles: true,
				onlyDirectories: false,
				transform: null
			};

			const actual = manager.prepare();

			assert.deepEqual(actual, expected);
		});

		it('should returns builded options for provided object', () => {
			const expected: manager.IOptions = {
				cwd: process.cwd(),
				deep: true,
				ignore: [],
				dot: false,
				stats: true,
				onlyFiles: true,
				onlyDirectories: false,
				transform: null
			};

			const actual = manager.prepare({ stats: true });

			assert.deepEqual(actual, expected);
		});
	});
});
