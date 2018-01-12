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
		const reader = getReader({ cwd: '.' });

		it('should returns root directory for reader with global base (.)', () => {
			const expected = process.cwd();

			const actual = reader.getRootDirectory({ base: '.' } as ITask);

			assert.equal(actual, expected);
		});

		it('should returns root directory for reader with non-global base (fixtures)', () => {
			const expected = path.join(process.cwd(), 'fixtures');

			const actual = reader.getRootDirectory({ base: 'fixtures' } as ITask);

			assert.equal(actual, expected);
		});
	});

	describe('.getReaderOptions', () => {
		const reader = getReader();

		it('should returns options for reader with global base (.)', () => {
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

		it('should returns options for reader with non-global base (fixtures)', () => {
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

	describe('.filter', () => {
		describe('Excluding nested directories', () => {
			it('should returns false for excluded directory', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*', '!**/directory'], ['**/directory']);

				assert.ok(!actual);
			});

			it('should returns false for files in excluded directory', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getEntry({
					path: 'fixtures/directory/file.txt',
					isFile: () => true
				});

				const actual = reader.filter(entry, ['**/*', '!**/directory/**'], ['**/directory/**']);

				assert.ok(!actual);
			});
		});

		describe('Excluding by «onlyFiles» options', () => {
			it('should returns true for file when the «onlyFiles» option is enabled', () => {
				const reader = getReader();

				const entry = getFileEntry(false /** dot */);

				const actual = reader.filter(entry, ['**/*.txt'], []);

				assert.ok(actual);
			});

			it('should returns true for file when the «onlyFiles» option is disabled', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getFileEntry(false /** dot */);

				const actual = reader.filter(entry, ['**/*.txt'], []);

				assert.ok(actual);
			});

			it('should returns false for directory when the «onlyFiles» option is enabled', () => {
				const reader = getReader();

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*.txt'], []);

				assert.ok(!actual);
			});

			it('should returns true for directory when the «onlyFiles» option is disabled', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(actual);
			});
		});

		describe('Excluding by «onlyDirectories» options', () => {
			it('should returns false for file when the «onlyDirectories» option is enabled', () => {
				const reader = getReader({ onlyFiles: false, onlyDirectories: true });

				const entry = getFileEntry(false /** dot */);

				const actual = reader.filter(entry, ['**/*.txt'], []);

				assert.ok(!actual);
			});

			it('should returns true for file when the «onlyDirectories» option is disabled', () => {
				const reader = getReader({ onlyFiles: false, onlyDirectories: false });

				const entry = getFileEntry(false /** dot */);

				const actual = reader.filter(entry, ['**/*.txt'], []);

				assert.ok(actual);
			});

			it('should returns true for directory when the «onlyDirectories» option is enabled', () => {
				const reader = getReader({ onlyFiles: false, onlyDirectories: true });

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(actual);
			});

			it('should returns true for directory when «onlyFiles» and «onlyDirectoryies» options is disabled', () => {
				const reader = getReader({ onlyFiles: false, onlyDirectories: false });

				const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(actual);
			});
		});

		describe('Patterns', () => {
			it('should returns false if patterns not a matched', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getFileEntry(false /** dot */);

				const actual = reader.filter(entry, ['**/*.md'], []);

				assert.ok(!actual);
			});

			it('should returns false by negative patterns', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getFileEntry(false /** dot */);

				const actual = reader.filter(entry, ['**/*', '!**/*.txt'], ['**/*.txt']);

				assert.ok(!actual);
			});

			it('should returns true by matched patterns', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getFileEntry(false /** dot */);

				const actual = reader.filter(entry, ['**/*.txt'], []);

				assert.ok(actual);
			});

			it('should returns false for files that starting with a period', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getFileEntry(true /** dot */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(!actual);
			});

			it('should returns false for directories that starting with a period', () => {
				const reader = getReader({ onlyFiles: false });

				const entry = getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(!actual);
			});

			it('should returns true for files that starting with a period if the «dot» option is enabled', () => {
				const reader = getReader({ onlyFiles: false, dot: true });

				const entry = getFileEntry(true /** dot */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(actual);
			});

			it('should returns true for directories that starting with a period if the «dot» option is enabled', () => {
				const reader = getReader({ onlyFiles: false, dot: true });

				const entry = getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

				const actual = reader.filter(entry, ['**/*'], []);

				assert.ok(actual);
			});
		});
	});

	describe('.deep', () => {
		it('should returns false if «deep» option is disabled', () => {
			const reader = getReader({ deep: false });

			const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

			const actual = reader.deep(entry, []);

			assert.ok(!actual);
		});

		it('should returns true for symlinked directory when the «followSymlinkedDirectories» option is enabled', () => {
			const reader = getReader();

			const entry = getDirectoryEntry(false /** dot */, true /** isSymbolicLink */);

			const actual = reader.deep(entry, []);

			assert.ok(actual);
		});

		it('should returns false for symlinked directory when the «followSymlinkedDirectories» option is disabled', () => {
			const reader = getReader({ followSymlinkedDirectories: false });

			const entry = getDirectoryEntry(false /** dot */, true /** isSymbolicLink */);

			const actual = reader.deep(entry, []);

			assert.ok(!actual);
		});

		it('should returns false if specified a limit of depth for «deep» option ', () => {
			const reader = getReader({ deep: 2 });

			const entry = getEntry({
				path: 'fixtures/directory/directory',
				isDirectory: () => true,
				depth: 3
			});

			const actual = reader.deep(entry, []);

			assert.ok(!actual);
		});

		it('should returns true if has no specified negative patterns', () => {
			const reader = getReader();

			const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

			const actual = reader.deep(entry, []);

			assert.ok(actual);
		});

		it('should returns true if negative patterns not a matched', () => {
			const reader = getReader();

			const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

			const actual = reader.deep(entry, ['**/directory/**']);

			assert.ok(actual);
		});

		it('should returns false for excluded directory by special pattern', () => {
			const reader = getReader();

			const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

			const actual = reader.deep(entry, ['**/directory']);

			assert.ok(!actual);
		});

		it('should returns false for directories that starting with a period', () => {
			const reader = getReader();

			const entry = getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

			const actual = reader.deep(entry, []);

			assert.ok(!actual);
		});

		it('should returns true for directories that starting with a period if the «dot» option is enabled', () => {
			const reader = getReader({ dot: true });

			const entry = getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

			const actual = reader.deep(entry, []);

			assert.ok(actual);
		});
	});

	describe('.isEnoentCodeError', () => {
		const reader = getReader();

		it('should returns true', () => {
			const error = new tests.EnoentErrnoException();

			const actual = reader.isEnoentCodeError(error);

			assert.ok(actual);
		});

		it('should returns false', () => {
			const error = new Error();

			const actual = reader.isEnoentCodeError(error);

			assert.ok(!actual);
		});
	});

	describe('.isDotDirectory', () => {
		const reader = getReader();

		it('should returns true', () => {
			const entry = getDirectoryEntry(true /** dot */, false /** isSymbolicLink */);

			const actual = reader.isDotDirectory(entry);

			assert.ok(actual);
		});

		it('should returns false', () => {
			const entry = getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

			const actual = reader.isDotDirectory(entry);

			assert.ok(!actual);
		});
	});
});
