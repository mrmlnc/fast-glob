import * as assert from 'assert';
import * as path from 'path';

import Settings, { Options } from '../../settings';
import * as tests from '../../tests';
import { EntryFilterFunction, Pattern } from '../../types/index';
import DeepFilter from './deep';

function getDeepFilterInstance(options?: Options): DeepFilter {
	const settings = new Settings(options);

	return new DeepFilter(settings, {
		dot: settings.dot
	});
}

function getFilter(positive: Pattern[], negative: Pattern[], options?: Options): EntryFilterFunction {
	return getDeepFilterInstance(options).getFilter(positive, negative);
}

describe('Providers → Filters → Deep', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const filter = getDeepFilterInstance();

			assert.ok(filter instanceof DeepFilter);
		});
	});

	describe('.filter', () => {
		describe('Skip by options.deep', () => {
			it('should return «false» when option is disabled', () => {
				const filter = getFilter(['fixtures/**'], [], { deep: false });

				const entry = tests.getDirectoryEntry();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return «false» when the entry has depth greater than options.deep', () => {
				const filter = getFilter(['fixtures/**'], [], { deep: 1 });

				const entry = tests.getDirectoryEntry({
					path: path.join('fixtures', 'one', 'two', 'three')
				});

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return «false» when the entry has depth equal to options.deep', () => {
				const filter = getFilter(['fixtures/**'], [], { deep: 1 });

				const entry = tests.getDirectoryEntry({
					path: path.join('fixtures', 'one', 'two')
				});

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return «true» when the entry has depth less then options.deep', () => {
				const filter = getFilter(['fixtures/**'], [], { deep: 2 });

				const entry = tests.getDirectoryEntry({
					path: path.join('fixtures', 'one', 'two')
				});

				const actual = filter(entry);

				assert.ok(actual);
			});
		});

		describe('Skip by max pattern depth', () => {
			it('should return «true» when max pattern depth is Infinity', () => {
				const filter = getFilter(['fixtures/**'], []);

				const entry = tests.getDirectoryEntry();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return «true» when max pattern depth is greater then entry depth', () => {
				const filter = getFilter(['fixtures/*/*/*'], []);

				const entry = tests.getDirectoryEntry({
					path: path.join('fixtures', 'one', 'two')
				});

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return «false» when max pattern depth is less then entry depth', () => {
				const filter = getFilter(['fixtures/*'], []);

				const entry = tests.getDirectoryEntry({
					path: path.join('fixtures', 'one', 'two', 'three', 'four')
				});

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Skip by «followSymlinkedDirectories» option', () => {
			it('should return «true» for symlinked directory when option is enabled', () => {
				const filter = getFilter(['**/*'], []);

				const entry = tests.getDirectoryEntry({
					isSymbolicLink: true
				});

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return «false» for symlinked directory when option is disabled', () => {
				const filter = getFilter(['**/*'], [], { followSymlinkedDirectories: false });

				const entry = tests.getDirectoryEntry({
					isSymbolicLink: true
				});

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Skip by «dot» option', () => {
			it('should return «true» for directory that starting with a period when option is enabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false, dot: true });

				const entry = tests.getDirectoryEntry({
					path: path.join('fixtures', '.directory')
				});

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return «false» for directory that starting with a period when option is disabled', () => {
				const filter = getFilter(['**/*'], []);

				const entry = tests.getDirectoryEntry({
					path: path.join('fixtures', '.directory')
				});

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Skip by negative patterns', () => {
			it('should return «true» when negative patterns is not defined', () => {
				const filter = getFilter(['**/*'], []);

				const entry = tests.getDirectoryEntry();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return «true» when the directory does not match to negative patterns', () => {
				const filter = getFilter(['**/*'], ['**/pony/**']);

				const entry = tests.getDirectoryEntry();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return «true» when negative patterns has no effect to depth reading', () => {
				const filter = getFilter(['**/*'], ['*', '**/*']);

				const entry = tests.getDirectoryEntry();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return «false» when the directory match to negative patterns', () => {
				const filter = getFilter(['**/*'], ['fixtures/directory']);

				const entry = tests.getDirectoryEntry();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return «false» when the directory match to negative patterns with effect to depth reading', () => {
				const filter = getFilter(['**/*'], ['fixtures/**']);

				const entry = tests.getDirectoryEntry();

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});
	});

	describe('Immutability', () => {
		it('should return the data without changes', () => {
			const filter = getFilter(['**/*'], [], { onlyFiles: false });

			const entry = tests.getDirectoryEntry();

			const expected = entry.path;

			filter(entry);

			assert.strictEqual(entry.path, expected);
		});
	});
});
