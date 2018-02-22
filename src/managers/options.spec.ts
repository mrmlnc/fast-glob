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
		brace: true,
		noglobstar: false,
		globstar: true,
		noext: false,
		extension: true,
		nocase: false,
		case: true,
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

		describe('The «brace» option', () => {
			it('should set false for the «brace» option if «nobrace» option is enabled', () => {
				const expected: manager.IOptions = getOptions({ brace: false, nobrace: true });

				const actual = manager.prepare({ nobrace: true });

				assert.deepEqual(actual, expected);
			});

			it('should set false for the «brace» option if «brace» option is disabled', () => {
				const expected: manager.IOptions = getOptions({ brace: false });

				const actual = manager.prepare({ brace: false });

				assert.deepEqual(actual, expected);
			});

			it('should set true for the «brace» option if «brace» and «nobrace» option is enabled', () => {
				const expected: manager.IOptions = getOptions({ brace: true, nobrace: true });

				const actual = manager.prepare({ brace: true, nobrace: true });

				assert.deepEqual(actual, expected);
			});
		});

		describe('The «globstar» option', () => {
			it('should set false for the «globstar» option if «noglobstar» option is enabled', () => {
				const expected: manager.IOptions = getOptions({ globstar: false, noglobstar: true });

				const actual = manager.prepare({ noglobstar: true });

				assert.deepEqual(actual, expected);
			});

			it('should set false for the «globstar» option if «globstar» option is disabled', () => {
				const expected: manager.IOptions = getOptions({ globstar: false });

				const actual = manager.prepare({ globstar: false });

				assert.deepEqual(actual, expected);
			});

			it('should set true for the «globstar» option if «globstar» and «noglobstar» option is enabled', () => {
				const expected: manager.IOptions = getOptions({ globstar: true, noglobstar: true });

				const actual = manager.prepare({ globstar: true, noglobstar: true });

				assert.deepEqual(actual, expected);
			});
		});

		describe('The «extension» option', () => {
			it('should set false for the «extension» option if «noext» option is enabled', () => {
				const expected: manager.IOptions = getOptions({ extension: false, noext: true });

				const actual = manager.prepare({ noext: true });

				assert.deepEqual(actual, expected);
			});

			it('should set false for the «extension» option if «extension» option is enabled', () => {
				const expected: manager.IOptions = getOptions({ extension: false });

				const actual = manager.prepare({ extension: false });

				assert.deepEqual(actual, expected);
			});

			it('should set true for the «extension» option if «extension» and «noext» option is enabled', () => {
				const expected: manager.IOptions = getOptions({ extension: true, noext: true });

				const actual = manager.prepare({ extension: true, noext: true });

				assert.deepEqual(actual, expected);
			});
		});

		describe('The «case» option', () => {
			it('should set false for the «case» option if «nocase» option is enabled', () => {
				const expected: manager.IOptions = getOptions({ case: false, nocase: true });

				const actual = manager.prepare({ nocase: true });

				assert.deepEqual(actual, expected);
			});

			it('should set false for the «case» option if «case» option is disabled', () => {
				const expected: manager.IOptions = getOptions({ case: false });

				const actual = manager.prepare({ case: false });

				assert.deepEqual(actual, expected);
			});

			it('should set true for the «extension» option if «case» and «nocase» option is enabled', () => {
				const expected: manager.IOptions = getOptions({ case: true, nocase: true });

				const actual = manager.prepare({ case: true, nocase: true });

				assert.deepEqual(actual, expected);
			});
		});
	});
});
