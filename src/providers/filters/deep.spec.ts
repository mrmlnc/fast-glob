import * as assert from 'assert';

import Settings from '../../settings';
import * as tests from '../../tests';
import DeepFilter from './deep';

import type { EntryFilterFunction, Pattern, Entry } from '../../types';
import type { Options } from '../../settings';

type FilterOptions = {
	base?: string;
	positive: Pattern[];
	negative?: Pattern[];
	options?: Options;
};

const DIRECTORY_ENTRY_LEVEL_1 = tests.entry.builder().path('root').directory().build();
const DIRECTORY_ENTRY_LEVEL_2 = tests.entry.builder().path('root/directory').directory().build();
const DIRECTORY_ENTRY_LEVEL_3 = tests.entry.builder().path('root/nested/directory').directory().build();

function getDeepFilterInstance(options?: Options): DeepFilter {
	const settings = new Settings(options);

	return new DeepFilter(settings, {
		dot: settings.dot,
	});
}

function getFilter(options: FilterOptions): EntryFilterFunction {
	const base = options.base ?? '.';
	const negative = options.negative ?? [];

	return getDeepFilterInstance(options.options).getFilter(base, options.positive, negative);
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

describe('Providers → Filters → Deep', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const filter = getDeepFilterInstance();

			assert.ok(filter instanceof DeepFilter);
		});
	});

	describe('.getFilter', () => {
		describe('options.deep', () => {
			it('should reject when an option has "0" as value', () => {
				reject(DIRECTORY_ENTRY_LEVEL_1, {
					positive: ['**/*'],
					options: { deep: 0 },
				});
			});

			it('should reject when the depth of entry is greater than an allowable value (without base)', () => {
				reject(DIRECTORY_ENTRY_LEVEL_3, {
					positive: ['**/*'],
					options: { deep: 1 },
				});
			});

			it('should reject when the depth of entry is greater than an allowable value (with base as current level)', () => {
				reject(DIRECTORY_ENTRY_LEVEL_3, {
					positive: ['**/*'],
					options: { deep: 1 },
				});
			});

			it('should reject when the depth of entry is greater than an allowable value (with nested base)', () => {
				reject(DIRECTORY_ENTRY_LEVEL_3, {
					base: 'root/a',
					positive: ['root/a/*'],
					options: { deep: 1 },
				});
			});

			it('should accept when an option has "Infinity" as value', () => {
				accept(DIRECTORY_ENTRY_LEVEL_1, {
					positive: ['**/*'],
					options: { deep: Infinity },
				});
			});
		});

		describe('options.followSymbolicLinks', () => {
			it('should reject when an entry is symbolic link and option is disabled', () => {
				const entry = tests.entry.builder().path('root').directory().symlink().build();

				reject(entry, {
					positive: ['**/*'],
					options: { followSymbolicLinks: false },
				});
			});

			it('should accept when an entry is symbolic link and option is enabled', () => {
				const entry = tests.entry.builder().path('root').directory().symlink().build();

				accept(entry, {
					positive: ['**/*'],
					options: { followSymbolicLinks: true },
				});
			});
		});

		describe('Positive pattern', () => {
			it('should reject when an entry does not match to the positive pattern', () => {
				reject(DIRECTORY_ENTRY_LEVEL_1, {
					positive: ['non-root/*'],
				});
			});

			it('should reject when an entry starts with leading dot and does not match to the positive pattern', () => {
				const entry = tests.entry.builder().path('./root').directory().build();

				reject(entry, {
					positive: ['non-root/*'],
				});
			});

			it('should accept when an entry match to the positive pattern with leading dot', () => {
				const entry = tests.entry.builder().path('./root').directory().build();

				accept(entry, {
					positive: ['./root/*'],
				});
			});

			it('should accept when the positive pattern does not match by level, but the "baseNameMatch" is enabled', () => {
				accept(DIRECTORY_ENTRY_LEVEL_2, {
					positive: ['*'],
					options: { baseNameMatch: true },
				});
			});

			it('should accept when the positive pattern has a globstar', () => {
				accept(DIRECTORY_ENTRY_LEVEL_3, {
					positive: ['**/*'],
				});
			});
		});

		describe('Negative pattern', () => {
			it('should reject when an entry match to the negative pattern', () => {
				reject(DIRECTORY_ENTRY_LEVEL_2, {
					positive: ['**/*'],
					negative: ['root/**'],
				});
			});

			it('should accept when the negative pattern has no effect to depth reading', () => {
				accept(DIRECTORY_ENTRY_LEVEL_3, {
					positive: ['**/*'],
					negative: ['**/*'],
				});
			});

			it('should accept when an entry does not match to the negative pattern', () => {
				accept(DIRECTORY_ENTRY_LEVEL_3, {
					positive: ['**/*'],
					negative: ['non-root/**/*'],
				});
			});
		});
	});

	describe('Immutability', () => {
		it('should return the data without changes', () => {
			const filter = getFilter({
				positive: ['**/*'],
			});

			const reference = tests.entry.builder().path('root/directory').directory().build();
			const entry = tests.entry.builder().path('root/directory').directory().build();

			filter(entry);

			assert.deepStrictEqual(entry, reference);
		});
	});
});
