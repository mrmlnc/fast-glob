import * as assert from 'node:assert';
import * as path from 'node:path';

import { describe, it } from 'mocha';

import Settings from '../../settings.js';
import * as tests from '../../tests/index.js';
import EntryTransformer from './entry.js';

import type { EntryTransformerFunction } from '../../types/index.js';
import type { Options } from '../../settings.js';

function getEntryTransformer(options?: Options): EntryTransformer {
	return new EntryTransformer(new Settings(options));
}

function getTransformer(options?: Options): EntryTransformerFunction {
	return getEntryTransformer(options).getTransformer();
}

describe('Providers → Transformers → Entry', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const filter = getEntryTransformer();

			assert.ok(filter instanceof EntryTransformer);
		});
	});

	describe('.getTransformer', () => {
		it('should return transformed entry as string when options is not provided', () => {
			const transformer = getTransformer();
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			const expected = 'root/file.txt';

			const actual = transformer(entry);

			assert.strictEqual(actual, expected);
		});

		it('should return transformed entry as object when the `objectMode` option is enabled', () => {
			const transformer = getTransformer({ objectMode: true });
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			const expected = entry;

			const actual = transformer(entry);

			assert.deepStrictEqual(actual, expected);
		});

		it('should return transformed entry as object when the `stats` option is enabled', () => {
			const transformer = getTransformer({ stats: true });
			const entry = tests.entry.builder().path('root/file.txt').file().stats().build();

			const expected = entry;

			const actual = transformer(entry);

			assert.deepStrictEqual(actual, expected);
		});

		it('should return entry with absolute filepath when the `absolute` option is enabled', () => {
			const transformer = getTransformer({ absolute: true });
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			const expected = path.join(process.cwd(), 'root', 'file.txt');

			const actual = transformer(entry);

			assert.strictEqual(actual, expected);
		});

		it('should return entry with trailing slash when the `markDirectories` is enabled', () => {
			const transformer = getTransformer({ markDirectories: true });
			const entry = tests.entry.builder().path('root/directory').directory().build();

			const expected = 'root/directory/';

			const actual = transformer(entry);

			assert.strictEqual(actual, expected);
		});

		it('should return correct entry when the `absolute` and `markDirectories` options is enabled', () => {
			const transformer = getTransformer({ absolute: true, markDirectories: true });
			const entry = tests.entry.builder().path('root/directory').directory().build();

			const expected = path.join(process.cwd(), 'root', 'directory', '/');

			const actual = transformer(entry);

			assert.strictEqual(actual, expected);
		});

		it('should do not mutate the entry when the `markDirectories` option is enabled', () => {
			const transformer = getTransformer({ markDirectories: true });
			const entry = tests.entry.builder().path('root/directory').directory().build();

			const actual = transformer(entry);

			assert.notStrictEqual(actual, entry.path);
		});
	});
});
