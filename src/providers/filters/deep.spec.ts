import * as assert from 'assert';

import * as tests from '../../tests';

import DeepFilter from './deep';

import * as optionsManager from '../../managers/options';

import { FilterFunction } from 'readdir-enhanced';
import { IOptions, IPartialOptions } from '../../managers/options';
import { Pattern } from '../../types/patterns';

function getDeepFilterInstance(options?: IPartialOptions): DeepFilter {
	const preparedOptions: IOptions = optionsManager.prepare(options);

	return new DeepFilter(preparedOptions, {
		dot: preparedOptions.dot
	});
}

function getFilter(patterns: Pattern[], globstar: boolean, options?: IPartialOptions): FilterFunction {
	return getDeepFilterInstance(options).getFilter(patterns, globstar);
}

describe('Providers → Filters → Deep', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const filter = getDeepFilterInstance();

			assert.ok(filter instanceof DeepFilter);
		});
	});

	describe('.call', () => {
		describe('Filter by «deep» option', () => {
			it('should return false for nested directory when option is disabled', () => {
				const filter = getFilter([], true /** globstar */, { deep: false });

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return false for nested directory when option has specified level', () => {
				const filter = getFilter([], true /** globstar */, { deep: 2 });

				const entry = tests.getEntry({
					path: 'fixtures/directory/directory',
					depth: 3,
					isDirectory: () => true
				});

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Filter by «followSymlinkedDirectories» option', () => {
			it('should return true for symlinked directory when option is enabled', () => {
				const filter = getFilter([], true /** globstar */);

				const entry = tests.getDirectoryEntry(false /** dot */, true /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for symlinked directory when option is disabled', () => {
				const filter = getFilter([], true /** globstar */, { followSymlinkedDirectories: false });

				const entry = tests.getDirectoryEntry(false /** dot */, true /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Filter by «dot» option', () => {
			it('should return true for directory that starting with a period when option is enabled', () => {
				const filter = getFilter([], true /** globstar */, { onlyFiles: false, dot: true });

				const entry = tests.getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for directory that starting with a period when option is disabled', () => {
				const filter = getFilter([], true /** globstar */);

				const entry = tests.getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Filter by patterns', () => {
			it('should return true for directory when negative patterns is not defined', () => {
				const filter = getFilter([], true /** globstar */);

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return true for directory that not matched to negative patterns', () => {
				const filter = getFilter(['**/pony/**'], true /** globstar */);

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return true for directory when negative patterns has globstar after directory name', () => {
				const filter = getFilter(['**/directory/**'], true /** globstar */);

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for directory that matched to negative patterns', () => {
				const filter = getFilter(['**/directory'], true /** globstar */);

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Filter by «globstar» parameter', () => {
			it('should return true by globstar parameter', () => {
				const filter = getFilter([], true /** globstar */);

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false by globstar parameter', () => {
				const filter = getFilter([], false /** globstar */);

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});
	});
});
