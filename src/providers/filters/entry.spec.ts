import * as assert from 'assert';

import Settings, { Options } from '../../settings';
import * as tests from '../../tests';
import { EntryFilterFunction, Pattern } from '../../types/index';
import * as utils from '../../utils/index';
import EntryFilter from './entry';

function getEntryFilterInstance(options?: Options): EntryFilter {
	const settings = new Settings(options);

	return new EntryFilter(settings, {
		dot: settings.dot
	});
}

function getFilter(positive: Pattern[], negative: Pattern[], options?: Options): EntryFilterFunction {
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

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for non-unique entry when option is enabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				// Create index record
				filter(entry);

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return true for non-unique entry when option is disabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false, unique: false });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				// Create index record
				filter(entry);

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should not build the index when option is disabled', () => {
				const filterInstance = getEntryFilterInstance({ onlyFiles: false, unique: false });

				const filter = filterInstance.getFilter(['**/*'], []);

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				filter(entry);

				assert.strictEqual(filterInstance.index.size, 0);
			});
		});

		describe('Filter by excluded directories', () => {
			it('should return false for excluded directory', () => {
				const filter = getFilter(['**/*', '!**/directory'], ['**/directory'], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return false for files in excluded directory', () => {
				const filter = getFilter(['**/*', '!**/directory/**'], ['**/directory/**'], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Filter by entry type', () => {
			describe('The «onlyFiles» option', () => {
				it('should return true for file when option is enabled', () => {
					const filter = getFilter(['**/*'], []);

					const entry = tests.entry.builder().path('root/file.txt').file().build();

					const actual = filter(entry);

					assert.ok(actual);
				});

				it('should return true for file when option is disabled', () => {
					const filter = getFilter(['**/*'], [], { onlyFiles: false });

					const entry = tests.entry.builder().path('root/file.txt').file().build();

					const actual = filter(entry);

					assert.ok(actual);
				});

				it('should return false for directory when option is enabled', () => {
					const filter = getFilter(['**/*'], []);

					const entry = tests.entry.builder().path('root/directory').directory().build();

					const actual = filter(entry);

					assert.ok(!actual);
				});

				it('should return true for directory when option is disabled', () => {
					const filter = getFilter(['**/*'], [], { onlyFiles: false });

					const entry = tests.entry.builder().path('root/directory').directory().build();

					const actual = filter(entry);

					assert.ok(actual);
				});
			});

			describe('The «onlyDirectories» option', () => {
				it('should return false for file when option is enabled', () => {
					const filter = getFilter(['**/*'], [], { onlyFiles: false, onlyDirectories: true });

					const entry = tests.entry.builder().path('root/file.txt').file().build();

					const actual = filter(entry);

					assert.ok(!actual);
				});

				it('should return true for file when option is disabled', () => {
					const filter = getFilter(['**/*'], [], { onlyFiles: false });

					const entry = tests.entry.builder().path('root/file.txt').file().build();

					const actual = filter(entry);

					assert.ok(actual);
				});

				it('should return true for directory when option is enabled', () => {
					const filter = getFilter(['**/*'], [], { onlyFiles: false, onlyDirectories: true });

					const entry = tests.entry.builder().path('root/directory').directory().build();

					const actual = filter(entry);

					assert.ok(actual);
				});

				it('should return false for directory when option is disabled', () => {
					const filter = getFilter(['**/*'], []);

					const entry = tests.entry.builder().path('root/directory').directory().build();

					const actual = filter(entry);

					assert.ok(!actual);
				});
			});
		});

		describe('Filter by «dot» option', () => {
			it('should return true for file that starting with a period when option is enabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false, dot: true });

				const entry = tests.entry.builder().path('root/.file.txt').file().build();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for file that starting with a period when option is disabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/.file.txt').file().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return true for directory that starting with a period when option is enabled', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false, dot: true });

				const entry = tests.entry.builder().path('root/.directory').directory().build();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for directory that starting with a period when option is disabled', () => {
				const filter = getFilter(['**/*'], []);

				const entry = tests.entry.builder().path('root/.directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Filter by absolute negative patterns', () => {
			it('should return true when `absolute` option is disabled', () => {
				const filter = getFilter(['**/*'], []);

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return true for file that no matched by negative pattern when `absolute` option is enabled', () => {
				const filter = getFilter(['**/*'], ['*'], { absolute: true });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for file that excluded by negative pattern with globstar when `absolute` option is enabled', () => {
				const filter = getFilter(['**/*'], ['**/*'], { absolute: true });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return false for file that excluded by absolute negative patterns when `absolute` option is enabled', () => {
				const negative = utils.path.makeAbsolute(process.cwd(), '**').replace(/\\/g, '/');
				const filter = getFilter(['**/*'], [negative], { absolute: true });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Filter by patterns', () => {
			it('should return true for file that matched to patterns', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for file that not matched to patterns', () => {
				const filter = getFilter(['**/*.md'], [], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return false for file that excluded by negative patterns', () => {
				const filter = getFilter(['**/*', '!**/*.txt'], ['**/*.txt'], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return true for directory that matched to patterns', () => {
				const filter = getFilter(['**/directory/**'], [], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return true for directory that matched to static patterns', () => {
				const filter = getFilter(['root/directory'], [], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return false for directory that not matched to patterns', () => {
				const filter = getFilter(['**/super_directory/**'], [], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return false for directory that matched to negative static pattern', () => {
				const filter = getFilter(['**'], ['root/directory'], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return false for directory that matched to negative pattern with globstar', () => {
				const filter = getFilter(['**'], ['root/directory/**'], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Immutability', () => {
			it('should return the data without changes', () => {
				const filter = getFilter(['**/*'], [], { onlyFiles: false });

				const entry = tests.entry.builder().path('root/directory').directory().build();

				const expected = entry.path;

				filter(entry);

				assert.strictEqual(entry.path, expected);
			});
		});
	});
});
