import * as assert from 'assert';

import Settings, { Options } from '../../settings';
import * as tests from '../../tests';
import { EntryFilterFunction, Pattern } from '../../types/index';
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

	describe('.getFilter', () => {
		describe('options.unique', () => {
			it('should return `false` when an option is enabled', () => {
				const filter = getFilter(['**/*'], []);

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				// Create index record
				filter(entry);

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should not build the index when an option is disabled', () => {
				const filterInstance = getEntryFilterInstance({ onlyFiles: false, unique: false });

				const filter = filterInstance.getFilter(['**/*'], []);

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				filter(entry);

				assert.strictEqual(filterInstance.index.size, 0);
			});
		});

		describe('options.onlyFiles', () => {
			it('should return `false` for the directory entry when an option is enabled', () => {
				const filter = getFilter(['**/*'], []);

				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return `true` for the file entry when an option is enabled', () => {
				const filter = getFilter(['**/*'], []);

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(actual);
			});
		});

		describe('options.onlyDirectories', () => {
			it('should return `false` for the directory entry when an option is enabled', () => {
				const filter = getFilter(['**/*'], [], { onlyDirectories: true });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return `true` for the directory entry when an option is enabled', () => {
				const filter = getFilter(['**/*'], [], { onlyDirectories: true });

				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(actual);
			});
		});

		describe('options.absolute', () => {
			it('should return `false` when an entry match to the negative pattern', () => {
				const filter = getFilter(['**/*'], ['**/*'], { absolute: true });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return `true` when an entry do not match to the negative pattern', () => {
				const filter = getFilter(['**/*'], ['*'], { absolute: true });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(actual);
			});
		});

		describe('options.baseNameMatch', () => {
			it('should return `false` when an option is disabled', () => {
				const filter = getFilter(['*'], []);

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return `true` when an option is enabled', () => {
				const filter = getFilter(['*'], [], { baseNameMatch: true });

				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(actual);
			});
		});

		describe('Pattern', () => {
			it('should return `false` when an entry match to the negative pattern', () => {
				const filter = getFilter(['**/*'], ['**/*']);
				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return `false` when an entry do not match to the positive pattern', () => {
				const filter = getFilter(['*'], []);
				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return `true` when an entry match to the positive pattern', () => {
				const filter = getFilter(['**/*'], []);
				const entry = tests.entry.builder().path('root/file.txt').file().build();

				const actual = filter(entry);

				assert.ok(actual);
			});
		});
	});

	describe('Immutability', () => {
		it('should return the data without changes', () => {
			const filter = getFilter(['**/*'], []);

			const reference = tests.entry.builder().path('root/file.txt').directory().build();
			const entry = tests.entry.builder().path('root/file.txt').directory().build();

			filter(entry);

			assert.deepStrictEqual(entry, reference);
		});
	});
});
