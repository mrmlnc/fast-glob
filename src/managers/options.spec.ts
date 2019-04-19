import * as assert from 'assert';

import * as manager from './options';

function getOptions(options?: manager.IPartialOptions): manager.IOptions {
	return {
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
		brace: true,
		globstar: true,
		extglob: true,
		case: true,
		matchBase: false,
		transform: null,
		...options
	};
}

describe('Managers → Options', () => {
	describe('.prepare', () => {
		it('should returns prepared options for empty object', () => {
			const expected: manager.IOptions = getOptions();

			const actual = manager.prepare();

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns prepared options for provided object', () => {
			const expected: manager.IOptions = getOptions({ stats: true });

			const actual = manager.prepare({ stats: true });

			assert.deepStrictEqual(actual, expected);
		});

		it('should disable the «onlyFiles» option if «onlyDirectories» option is enabled', () => {
			const expected: manager.IOptions = getOptions({
				onlyFiles: false,
				onlyDirectories: true
			});

			const actual = manager.prepare({ onlyDirectories: true });

			assert.deepStrictEqual(actual, expected);
		});

		describe('The «brace» option', () => {
			it('should set false for the «brace» option if «brace» option is disabled', () => {
				const expected: manager.IOptions = getOptions({ brace: false });

				const actual = manager.prepare({ brace: false });

				assert.deepStrictEqual(actual, expected);
			});
		});

		describe('The «globstar» option', () => {
			it('should set false for the «globstar» option if «globstar» option is disabled', () => {
				const expected: manager.IOptions = getOptions({ globstar: false });

				const actual = manager.prepare({ globstar: false });

				assert.deepStrictEqual(actual, expected);
			});
		});

		describe('The «extglob» option', () => {
			it('should set false for the «extglob» option if «extglob» option is enabled', () => {
				const expected: manager.IOptions = getOptions({ extglob: false });

				const actual = manager.prepare({ extglob: false });

				assert.deepStrictEqual(actual, expected);
			});
		});

		describe('The «case» option', () => {
			it('should set false for the «case» option if «case» option is disabled', () => {
				const expected: manager.IOptions = getOptions({ case: false });

				const actual = manager.prepare({ case: false });

				assert.deepStrictEqual(actual, expected);
			});
		});
	});
});
