import * as assert from 'assert';

import * as tests from '../../tests';

import EntryFilter from './entry';

import * as optionsManager from '../../managers/options';

import { FilterFunction } from '@mrmlnc/readdir-enhanced';
import { IOptions, IPartialOptions } from '../../managers/options';
import { Pattern } from '../../types/patterns';

function getEntryFilterInstance(options?: IPartialOptions): EntryFilter {
	const preparedOptions: IOptions = optionsManager.prepare(options);

	return new EntryFilter(preparedOptions, {
		dot: preparedOptions.dot
	});
}

function getFilter(positive: Pattern[], negative: Pattern[], options?: IPartialOptions): FilterFunction {
	return getEntryFilterInstance(options).getFilter(positive, negative);
}

describe('Providers → Filters → Entry', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const filter = getEntryFilterInstance();

			assert.ok(filter instanceof EntryFilter);
		});
	});

	describe('.call', () => {
		describe('Filter by «unique» option', () => {
			it('should return true for unique entry when option is enabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false });

				const entry = tests.getFileEntry(false /** dot */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for non-unique entry when option is enabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false });

				const entry = tests.getFileEntry(false /** dot */);

				// Create index record
				filter(entry);

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return true for non-unique entry when option is disabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false, unique: false });

				const entry = tests.getFileEntry(false /** dot */);

				// Create index record
				filter(entry);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should not build the index when option is disabled', () => {
				const filterInstance = getEntryFilterInstance({ onlyFiles: false, unique: false });

				const filter = filterInstance.getFilter(['**/*'], []);

				const entry = tests.getFileEntry(false /** dot */);

				filter(entry);

				assert.equal(filterInstance.index.size, 0);
			});
		});

		describe('Filter by excluded directories', () => {
			it('should return false for excluded directory', () => {
				const filter = getFilter(['**/*', '!**/directory'], ['**/directory'], { onlyFiles: false });

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return false for files in excluded directory', () => {
				const filter = getFilter(['**/*', '!**/directory/**'], ['**/directory/**'], { onlyFiles: false });

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Filter by entry type', () => {
			describe('The «onlyFiles» option', () => {
				it('should return true for file when option is enabled', () => {
					const filter = getFilter(['**/*'], []);

					const entry = tests.getFileEntry(false /** dot */);

					const actual = filter(entry);

					assert.ok(actual);
				});

				it('should return true for file when option is disabled', () => {
					const filter = getFilter(['**/*'], [], { onlyFiles: false });

					const entry = tests.getFileEntry(false /** dot */);

					const actual = filter(entry);

					assert.ok(actual);
				});

				it('should return false for directory when option is enabled', () => {
					const filter = getFilter(['**/*'], []);

					const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

					const actual = filter(entry);

					assert.ok(!actual);
				});

				it('should return true for directory when option is disabled', () => {
					const filter = getFilter(['**/*'], [], { onlyFiles: false });

					const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

					const actual = filter(entry);

					assert.ok(actual);
				});
			});

			describe('The «onlyDirectories» option', () => {
				it('should return false for file when option is enabled', () => {
					const filter = getFilter(['**/*'], [], { onlyFiles: false, onlyDirectories: true });

					const entry = tests.getFileEntry(false /** dot */);

					const actual = filter(entry);

					assert.ok(!actual);
				});

				it('should return true for file when option is disabled', () => {
					const filter = getFilter(['**/*'], [], { onlyFiles: false });

					const entry = tests.getFileEntry(false /** dot */);

					const actual = filter(entry);

					assert.ok(actual);
				});

				it('should return true for directory when option is enabled', () => {
					const filter = getFilter(['**/*'], [], { onlyFiles: false, onlyDirectories: true });

					const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

					const actual = filter(entry);

					assert.ok(actual);
				});

				it('should return false for directory when option is disabled', () => {
					const filter = getFilter(['**/*'], []);

					const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

					const actual = filter(entry);

					assert.ok(!actual);
				});
			});
		});

		describe('Filter by «dot» option', () => {
			it('should return true for file that starting with a period when option is enabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false, dot: true });

				const entry = tests.getFileEntry(true /** dot */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for file that starting with a period when option is disabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false });

				const entry = tests.getFileEntry(true /** dot */);

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return true for directory that starting with a period when option is enabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false, dot: true });

				const entry = tests.getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for directory that starting with a period when option is disabled', () => {
				const filter = getFilter(['**/*'], []);

				const entry = tests.getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Filter by patterns', () => {
			it('should return true for file that matched to patterns', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false });

				const entry = tests.getFileEntry(false /** dot */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for file that not matched to patterns', () => {
				const filter = getFilter(['**/*.md'], [], { onlyFiles: false });

				const entry = tests.getFileEntry(false /** dot */);

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return false for file that excluded by negative patterns', () => {
				const filter = getFilter(['**/*', '!**/*.txt'], ['**/*.txt'], { onlyFiles: false });

				const entry = tests.getFileEntry(false /** dot */);

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return true for directory that matched to patterns', () => {
				const filter = getFilter(['**/directory/**'], [], { onlyFiles: false });

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for directory that not matched to patterns', () => {
				const filter = getFilter(['**/super_directory/**'], [], { onlyFiles: false });

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Idempotence', () => {
			it('should return the data without changing', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false });

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const expected = entry.path;

				filter(entry);

				assert.equal(entry.path, expected);
			});
		});
	});
});
