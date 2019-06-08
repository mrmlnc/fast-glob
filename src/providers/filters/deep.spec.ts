import * as assert from 'assert';

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

function getFilter(base: string, positive: Pattern[], negative: Pattern[], options?: Options): EntryFilterFunction {
	return getDeepFilterInstance(options).getFilter(base, positive, negative);
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
			it('should return `false` when option has 0 as value', () => {
				const filter = getFilter('.', ['**/*'], [], { deep: 0 });
				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return `false` when the depth of entry is greater than the allowable (without base)', () => {
				const filter = getFilter('', ['**/*'], [], { deep: 1 });
				const entry = tests.entry.builder().path('root/one/two').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return `false` when the depth of entry is greater than the allowable (with base as current level)', () => {
				const filter = getFilter('.', ['**/*'], [], { deep: 1 });
				const entry = tests.entry.builder().path('root/one/two').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return `false` when the depth of entry is greater than the allowable (with nested base)', () => {
				const filter = getFilter('root/one', ['root/one/**/*'], [], { deep: 1 });
				const entry = tests.entry.builder().path('root/one/two').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Max pattern depth', () => {
			it('should return `false` when the depth of entry is greater that the pattern depth', () => {
				const filter = getFilter('root', ['root/*'], []);
				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('options.followSymbolicLinks', () => {
			it('should return `false` when an entry is symbolic link and option is disabled', () => {
				const filter = getFilter('.', ['**/*'], [], { followSymbolicLinks: false });
				const entry = tests.entry.builder().path('root/directory').directory().symlink().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('options.dot', () => {
			it('should return `false` when an entry basename starts with dot and option is disabled', () => {
				const filter = getFilter('.', ['**/*'], [], { dot: false });
				const entry = tests.entry.builder().path('root/.directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});
		});

		describe('Pattern', () => {
			it('should return `false` when an entry match to the negative pattern', () => {
				const filter = getFilter('.', ['**/*'], ['root/**']);
				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(!actual);
			});

			it('should return `true` when the negative pattern has no effect to depth reading', () => {
				const filter = getFilter('.', ['**/*'], ['**/*']);
				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(actual);
			});

			it('should return `true`', () => {
				const filter = getFilter('.', ['**/*'], []);
				const entry = tests.entry.builder().path('root/directory').directory().build();

				const actual = filter(entry);

				assert.ok(actual);
			});
		});
	});

	describe('Immutability', () => {
		it('should return the data without changes', () => {
			const filter = getFilter('.', ['**/*'], []);

			const reference = tests.entry.builder().path('root/directory').directory().build();
			const entry = tests.entry.builder().path('root/directory').directory().build();

			filter(entry);

			assert.deepStrictEqual(entry, reference);
		});
	});
});
