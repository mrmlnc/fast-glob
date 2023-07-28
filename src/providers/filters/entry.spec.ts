import * as assert from 'node:assert';
import * as path from 'node:path';

import Settings from '../../settings';
import * as tests from '../../tests';
import EntryFilter from './entry';

import type { EntryFilterFunction, Pattern, Entry } from '../../types';
import type { Options } from '../../settings';

interface FilterOptions {
	positive: Pattern[];
	negative?: Pattern[];
	options?: Options;
}

const FILE_ENTRY = tests.entry.builder().path('root/file.txt').file().build();
const DIRECTORY_ENTRY = tests.entry.builder().path('root/directory').directory().build();

function getEntryFilterInstance(options?: Options): EntryFilter {
	const settings = new Settings(options);

	return new EntryFilter(settings, {
		dot: settings.dot,
	});
}

function getFilter(options: FilterOptions): EntryFilterFunction {
	const negative = options.negative ?? [];

	return getEntryFilterInstance(options.options).getFilter(options.positive, negative);
}

function getResult(entry: Entry, options: FilterOptions): boolean {
	const filter = getFilter(options);

	return filter(entry);
}

function accept(entry: Entry, options: FilterOptions): void {
	assert.strictEqual(getResult(entry, options), true);
}

function reject(entry: Entry, options: FilterOptions): void {
	assert.strictEqual(getResult(entry, options), false);
}

describe('Providers → Filters → Entry', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const filter = getEntryFilterInstance();

			assert.ok(filter instanceof EntryFilter);
		});
	});

	describe('.getFilter', () => {
		describe('options.unique', () => {
			it('should do not build the index when an option is disabled', () => {
				const filterInstance = getEntryFilterInstance({ unique: false });

				const filter = filterInstance.getFilter(['**/*'], []);

				filter(FILE_ENTRY);

				assert.strictEqual(filterInstance.index.size, 0);
			});

			it('should do not add an entry to the index when an entry does not match to patterns', () => {
				const filterInstance = getEntryFilterInstance();

				const filter = filterInstance.getFilter(['**/*.unrelated-file-extension'], []);

				filter(FILE_ENTRY);

				assert.strictEqual(filterInstance.index.size, 0);
			});

			it('should reject a duplicate entry', () => {
				const filter = getFilter({
					positive: ['**/*'],
				});

				filter(FILE_ENTRY);

				const actual = filter(FILE_ENTRY);

				assert.ok(!actual);
			});

			it('should reject a duplicate entry when the two entries differ only by the leading dot segment', () => {
				const first = tests.entry.builder().path('file.txt').file().build();
				const second = tests.entry.builder().path('./file.txt').file().build();

				const filter = getFilter({
					positive: ['*', './file.txt'],
				});

				assert.ok(filter(first));
				assert.ok(!filter(second));
			});

			it('should accept a duplicate entry when an option is disabled', () => {
				const filter = getFilter({
					positive: ['**/*'],
					options: { unique: false },
				});

				filter(FILE_ENTRY);

				const actual = filter(FILE_ENTRY);

				assert.ok(actual);
			});
		});

		describe('options.onlyFiles', () => {
			it('should reject a directory entry', () => {
				reject(DIRECTORY_ENTRY, {
					positive: ['**/*'],
					options: { onlyFiles: true },
				});
			});

			it('should accept a directory entry', () => {
				accept(DIRECTORY_ENTRY, {
					positive: ['**/*'],
					options: { onlyFiles: false },
				});
			});

			it('should accept a file entry', () => {
				accept(FILE_ENTRY, {
					positive: ['**/*'],
					options: { onlyFiles: true },
				});
			});
		});

		describe('options.onlyDirectories', () => {
			it('should reject a file entry', () => {
				reject(FILE_ENTRY, {
					positive: ['**/*'],
					options: { onlyDirectories: true },
				});
			});

			it('should accept a directory entry', () => {
				accept(DIRECTORY_ENTRY, {
					positive: ['**/*'],
					options: { onlyDirectories: true },
				});
			});
		});

		describe('options.absolute', () => {
			it('should reject when an entry match to the negative pattern', () => {
				reject(FILE_ENTRY, {
					positive: ['**/*'],
					negative: ['**/*'],
					options: { absolute: true },
				});
			});

			it('should reject when an entry match to the negative pattern with absolute path', () => {
				const negative = path.posix.join(process.cwd().replaceAll('\\', '/'), '**', '*');

				reject(FILE_ENTRY, {
					positive: ['**/*'],
					negative: [negative],
					options: { absolute: true },
				});
			});

			it('should accept when an entry does not match to the negative pattern', () => {
				accept(FILE_ENTRY, {
					positive: ['**/*'],
					negative: ['*'],
					options: { absolute: true },
				});
			});

			it('should accept when an entry does not match to the negative pattern with absolute path', () => {
				const negative = path.posix.join(process.cwd().replaceAll('\\', '/'), 'non-root', '**', '*');

				accept(FILE_ENTRY, {
					positive: ['**/*'],
					negative: [negative],
					options: { absolute: true },
				});
			});
		});

		describe('options.baseNameMatch', () => {
			it('should reject an entry', () => {
				reject(FILE_ENTRY, {
					positive: ['file.txt'],
					options: { baseNameMatch: false },
				});
			});

			it('should accept an entry', () => {
				accept(FILE_ENTRY, {
					// The task manager adds globstar for patterns without slash.
					positive: ['**/file.txt'],
					options: { baseNameMatch: true },
				});
			});
		});

		describe('Pattern', () => {
			it('should reject when an entry match to the negative pattern', () => {
				reject(FILE_ENTRY, {
					positive: ['**/*'],
					negative: ['**/*'],
				});
			});

			it('should reject when an entry does not match to the positive pattern', () => {
				reject(FILE_ENTRY, {
					positive: ['*'],
				});
			});

			it('should accept when an entry match to the positive pattern with a leading dot', () => {
				accept(FILE_ENTRY, {
					positive: ['./**/*'],
				});
			});

			it('should accept an entry with a leading dot', () => {
				const entry = tests.entry.builder().path('./root/file.txt').file().build();

				accept(entry, {
					positive: ['**/*'],
				});
			});

			it('should accept when an entry match to the positive pattern', () => {
				accept(FILE_ENTRY, {
					positive: ['**/*'],
				});
			});

			it('should try to apply patterns to the path with the trailing slash for directory entry', () => {
				accept(DIRECTORY_ENTRY, {
					positive: ['**/'],
					options: { onlyFiles: false },
				});
			});

			it('should not try to apply patterns to the path with the trailing slash for non-directory entry', () => {
				reject(FILE_ENTRY, {
					positive: ['**/'],
					options: { onlyFiles: false },
				});
			});

			it('should reject a hidden entry by negative pattern even when the dot options is disabled', () => {
				const entry = tests.entry.builder().path('root/files/.hidden.txt').file().build();

				reject(entry, {
					positive: ['**/!(ignore)*.txt'],
					negative: ['**/files/**/*'],
					options: { dot: false },
				});
			});
		});
	});

	describe('Immutability', () => {
		it('should return the data without changes', () => {
			const filter = getFilter({
				positive: ['**/*'],
			});

			const reference = tests.entry.builder().path('root/file.txt').file().build();
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			filter(entry);

			assert.deepStrictEqual(entry, reference);
		});
	});
});
