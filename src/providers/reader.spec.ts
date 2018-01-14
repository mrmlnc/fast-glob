import * as assert from 'assert';
import * as path from 'path';

import * as tests from '../tests';

import Reader from './reader';

import * as optionsManager from '../managers/options';

import { IOptions, IPartialOptions } from '../managers/options';
import { ITask } from '../managers/tasks';

import { Entry } from '../types/entries';

function getEntry(entry?: Partial<Entry>): Entry {
	return Object.assign({
		isFile: () => false,
		isDirectory: () => false,
		isSymbolicLink: () => false,
		path: 'path',
		depth: 1
	} as Entry, entry);
}

function getFileEntry(dot: boolean): Entry {
	return getEntry({
		path: dot ? 'fixtures/.file.txt' : 'fixtures/file.txt',
		isFile: () => true
	});
}

function getDirectoryEntry(dot: boolean, isSymbolicLink: boolean): Entry {
	return getEntry({
		path: dot ? 'fixtures/.directory' : 'fixtures/directory',
		isDirectory: () => true,
		isSymbolicLink: () => isSymbolicLink
	});
}

class TestReader extends Reader {
	public read(_task: ITask): Array<{}> {
		return [];
	}
}

function getReader(options?: IPartialOptions): TestReader {
	const preparedOptions: IOptions = optionsManager.prepare(options);

	return new TestReader(preparedOptions);
}

describe('Providers → Reader', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = getReader();

			assert.ok(reader instanceof Reader);
		});
	});

	describe('.getRootDirectory', () => {
		it('should return root directory for reader with global base (.)', () => {
			const reader = getReader();

			const expected = process.cwd();

			const actual = reader.getRootDirectory({ base: '.' } as ITask);

			assert.equal(actual, expected);
		});

		it('should return root directory for reader with non-global base (fixtures)', () => {
			const reader = getReader();

			const expected = path.join(process.cwd(), 'fixtures');

			const actual = reader.getRootDirectory({ base: 'fixtures' } as ITask);

			assert.equal(actual, expected);
		});
	});

	describe('.getReaderOptions', () => {
		it('should return options for reader with global base (.)', () => {
			const reader = getReader();

			const actual = reader.getReaderOptions({
				base: '.',
				patterns: ['**/*'],
				positive: ['**/*'],
				negative: []
			});

			assert.equal(actual.basePath, '');
			assert.equal(actual.sep, '/');
			assert.equal(typeof actual.filter, 'function');
			assert.equal(typeof actual.deep, 'function');
		});

		it('should return options for reader with non-global base (fixtures)', () => {
			const reader = getReader();

			const actual = reader.getReaderOptions({
				base: 'fixtures',
				patterns: ['**/*'],
				positive: ['**/*'],
				negative: []
			});

			assert.equal(actual.basePath, 'fixtures');
			assert.equal(actual.sep, '/');
			assert.equal(typeof actual.filter, 'function');
			assert.equal(typeof actual.deep, 'function');
		});
	});

	describe('.getMicromatchOptions', () => {
		it('should return options for micromatch', () => {
			const reader = getReader();

			const expected: micromatch.Options = {
				dot: false,
				matchBase: false,
				nobrace: false,
				nocase: false,
				noext: false,
				noglobstar: false
			};

			const actual = reader.getMicromatchOptions();

			assert.deepEqual(actual, expected);
		});
	});

	describe('.filter', () => {
		describe('Filter by «unique» option', () => {
			it('should return true for unique entry when option is enabled', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getFileEntry(false /** dot */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(actual);
			});

			it('should return false for non-unique entry when option is enabled', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getFileEntry(false /** dot */);

				// Create index record
				reader.filter(entry, ['**/*'], []);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(!actual);
			});

			it('should return true for non-unique entry when option is disabled', () => {
				const reader = getReader({ onlyFiles: false, unique: false });

				const entry = getFileEntry(false /** dot */);

				// Create index record
				reader.filter(entry, ['**/*'], []);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(actual);
			});

			it('should not build the index when option is disabled', () => {
				const reader = getReader({ onlyFiles: false, unique: false });

				const entry = getFileEntry(false /** dot */);

				reader.filter(entry, ['**/*'], []);

				assert.equal(reader.index.size, 0);
			});
		});

		describe('Filter by excluded directories', () => {
			it('should return false for excluded directory', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*', '!**/directory'], ['**/directory']);

				assert.ok(!actual);
			});

			it('should return false for files in excluded directory', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*', '!**/directory/**'], ['**/directory/**']);

				assert.ok(!actual);
			});
		});

		describe('Filter by entry type', () => {
			describe('The «onlyFiles» option', () => {
				it('should return true for file when option is enabled', () => {
					const reader = getReader();

					const entry = getFileEntry(false /** dot */);

					const actual = reader.filter(entry, ['**/*'], []);

					assert.ok(actual);
				});

				it('should return true for file when option is disabled', () => {
					const reader = getReader({ onlyFiles: false });

					const entry = getFileEntry(false /** dot */);

					const actual = reader.filter(entry, ['**/*'], []);

					assert.ok(actual);
				});

				it('should return false for directory when option is enabled', () => {
					const reader = getReader();

					const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

					const actual = reader.filter(entry, ['**/*'], []);

					assert.ok(!actual);
				});

				it('should return true for directory when option is disabled', () => {
					const reader = getReader({ onlyFiles: false });

					const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

					const actual = reader.filter(entry, ['**/*'], []);

					assert.ok(actual);
				});
			});

			describe('The «onlyDirectories» option', () => {
				it('should return false for file when option is enabled', () => {
					const reader = getReader({ onlyFiles: false, onlyDirectories: true });

					const entry = getFileEntry(false /** dot */);

					const actual = reader.filter(entry, ['**/*'], []);

					assert.ok(!actual);
				});

				it('should return true for file when option is disabled', () => {
					const reader = getReader({ onlyFiles: false });

					const entry = getFileEntry(false /** dot */);

					const actual = reader.filter(entry, ['**/*'], []);

					assert.ok(actual);
				});

				it('should return true for directory when option is enabled', () => {
					const reader = getReader({ onlyFiles: false, onlyDirectories: true });

					const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

					const actual = reader.filter(entry, ['**/*'], []);

					assert.ok(actual);
				});

				it('should return false for directory when option is disabled', () => {
					const reader = getReader();

					const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

					const actual = reader.filter(entry, ['**/*'], []);

					assert.ok(!actual);
				});
			});
		});

		describe('Filter by «dot» option', () => {
			it('should return true for file that starting with a period when option is enabled', () => {
				const reader = getReader({ onlyFiles: false, dot: true });

				const entry = getFileEntry(true /** dot */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(actual);
			});

			it('should return false for file that starting with a period when option is disabled', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getFileEntry(true /** dot */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(!actual);
			});

			it('should return true for directory that starting with a period when option is enabled', () => {
				const reader = getReader({ onlyFiles: false, dot: true });

				const entry = getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(actual);
			});

			it('should return false for directory that starting with a period when option is disabled', () => {
				const reader = getReader();

				const entry = getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(!actual);
			});
		});
	});

	describe('Filter by patterns', () => {
		it('should return true for file that matched to patterns', () => {
			const reader = getReader({ onlyFiles: false });

			const entry = getFileEntry(false /** dot */);

			const actual = reader.filter(entry, ['**/*'], []);

			assert.ok(actual);
		});

		it('should return false for file that not matched to patterns', () => {
			const reader = getReader({ onlyFiles: false });

			const entry = getFileEntry(false /** dot */);

			const actual = reader.filter(entry, ['**/*.md'], []);

			assert.ok(!actual);
		});

		it('should return false for file that excluded by negative patterns', () => {
			const reader = getReader({ onlyFiles: false });

			const entry = getFileEntry(false /** dot */);

			const actual = reader.filter(entry, ['**/*', '!**/*.txt'], ['**/*.txt']);

			assert.ok(!actual);
		});

		it('should return true for directory that matched to patterns', () => {
			const reader = getReader({ onlyFiles: false });

			const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

			const actual = reader.filter(entry, ['**/directory/**'], []);

			assert.ok(actual);
		});

		it('should return false for directory that not matched to patterns', () => {
			const reader = getReader({ onlyFiles: false });

			const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

			const actual = reader.filter(entry, ['**/super_directory/**'], []);

			assert.ok(!actual);
		});
	});

	describe('.deep', () => {
		describe('Filter by «deep» option', () => {
			it('should return false for nested directory when option is disabled', () => {
				const reader = getReader({ deep: false });

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.deep(entry, []);

				assert.ok(!actual);
			});

			it('should return false for nested directory when option has specified level', () => {
				const reader = getReader({ deep: 2 });

				const entry = getEntry({
					path: 'fixtures/directory/directory',
					depth: 3,
					isDirectory: () => true
				});

				const actual = reader.deep(entry, []);

				assert.ok(!actual);
			});
		});

		describe('Filter by «followSymlinkedDirectories» option', () => {
			it('should return true for symlinked directory when option is enabled', () => {
				const reader = getReader();

				const entry = getDirectoryEntry(false /** dot */, true /** isSymbolicLink */);

				const actual = reader.deep(entry, []);

				assert.ok(actual);
			});

			it('should return false for symlinked directory when option is disabled', () => {
				const reader = getReader({ followSymlinkedDirectories: false });

				const entry = getDirectoryEntry(false /** dot */, true /** isSymbolicLink */);

				const actual = reader.deep(entry, []);

				assert.ok(!actual);
			});
		});

		describe('Filter by «dot» option', () => {
			it('should return true for directory that starting with a period when option is enabled', () => {
				const reader = getReader({ onlyFiles: false, dot: true });

				const entry = getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

				const actual = reader.deep(entry, []);

				assert.ok(actual);
			});

			it('should return false for directory that starting with a period when option is disabled', () => {
				const reader = getReader();

				const entry = getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

				const actual = reader.deep(entry, []);

				assert.ok(!actual);
			});
		});

		describe('Filter by patterns', () => {
			it('should return true for directory when negative patterns is not defined', () => {
				const reader = getReader();

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.deep(entry, []);

				assert.ok(actual);
			});

			it('should return true for directory that not matched to negative patterns', () => {
				const reader = getReader();

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.deep(entry, ['**/pony/**']);

				assert.ok(actual);
			});

			it('should return true for directory when negative patterns has globstar after directory name', () => {
				const reader = getReader();

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.deep(entry, ['**/directory/**']);

				assert.ok(actual);
			});

			it('should return false for directory that matched to negative patterns', () => {
				const reader = getReader();

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.deep(entry, ['**/directory']);

				assert.ok(!actual);
			});
		});
	});

	describe('.transform', () => {
		describe('The «markDirectories» option', () => {
			it('should return mark directory when option is enabled', () => {
				const reader = getReader({ markDirectories: true });

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const expected: string = 'fixtures/directory/';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});

			it('should do nothing with file when option is enabled', () => {
				const reader = getReader({ markDirectories: true });

				const entry = getFileEntry(false /** dot */);

				const expected: string = 'fixtures/file.txt';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});

			it('should return non-marked directory when option is disabled', () => {
				const reader = getReader();

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const expected: string = 'fixtures/directory';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});
		});

		describe('The «absolute» option', () => {
			it('should return transformed entry when option is provided', () => {
				const reader = getReader({ absolute: true });

				const entry = getFileEntry(false /** dot */);

				const expected: string = path.join(process.cwd(), 'fixtures/file.txt');

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});

			it('should return do nothing when option is not provided', () => {
				const reader = getReader();

				const entry = getFileEntry(false /** dot */);

				const expected: string = 'fixtures/file.txt';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});
		});

		describe('The «transform» option', () => {
			it('should return transformed entry when option is provided', () => {
				const reader = getReader({ transform: () => 'cake' });

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const expected: string = 'cake';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});

			it('should return do nothing when option is not provided', () => {
				const reader = getReader();

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const expected: string = 'fixtures/directory';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});
		});
	});

	describe('.isEnoentCodeError', () => {
		it('should return true for ENOENT error', () => {
			const reader = getReader();

			const error = new tests.EnoentErrnoException();

			const actual = reader.isEnoentCodeError(error);

			assert.ok(actual);
		});

		it('should return false for non-ENOENT error', () => {
			const reader = getReader();

			const error = new Error();

			const actual = reader.isEnoentCodeError(error);

			assert.ok(!actual);
		});
	});

	describe('.isDotDirectory', () => {
		it('should return true for dot directory', () => {
			const reader = getReader();

			const entry = getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

			const actual = reader.isDotDirectory(entry);

			assert.ok(actual);
		});

		it('should return false for non-dot directory', () => {
			const reader = getReader();

			const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

			const actual = reader.isDotDirectory(entry);

			assert.ok(!actual);
		});
	});
});
