import * as assert from 'assert';

import * as pkg from './index';

import { TEntryItem } from './types/entries';

describe('Package', () => {
	describe('.sync', () => {
		it('should returns entries', () => {
			const expected: TEntryItem[] = [
				'fixtures/file.md',
				'fixtures/first/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual = pkg.sync(['fixtures/**/*.md']);

			assert.deepEqual(actual.sort(), expected);
		});

		it('should returns entries (two sources)', () => {
			const expected: TEntryItem[] = [
				'fixtures/first/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual = pkg.sync(['fixtures/first/**/*.md', 'fixtures/second/**/*.md']);

			assert.deepEqual(actual.sort(), expected);
		});
	});

	describe('.async', () => {
		it('should returns entries', async () => {
			const expected: TEntryItem[] = [
				'fixtures/file.md',
				'fixtures/first/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual = await pkg.async(['fixtures/**/*.md']);

			assert.deepEqual(actual.sort(), expected);
		});

		it('should returns entries (two sources)', async () => {
			const expected: TEntryItem[] = [
				'fixtures/first/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual = await pkg.async(['fixtures/first/**/*.md', 'fixtures/second/**/*.md']);

			assert.deepEqual(actual.sort(), expected);
		});
	});

	describe('.stream', () => {
		it('should retruns entries', (done) => {
			const expected: TEntryItem[] = [
				'fixtures/file.md',
				'fixtures/first/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual: TEntryItem[] = [];

			const stream = pkg.stream(['fixtures/**/*.md']);

			stream.on('data', (entry) => actual.push(entry));
			stream.on('error', (err) => assert.fail(err));
			stream.on('end', () => {
				assert.deepEqual(actual.sort(), expected);
				done();
			});
		});

		it('should retruns entries (two sources)', (done) => {
			const expected: TEntryItem[] = [
				'fixtures/first/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual: TEntryItem[] = [];

			const stream = pkg.stream(['fixtures/first/**/*.md', 'fixtures/second/**/*.md']);

			stream.on('data', (entry) => actual.push(entry));
			stream.on('error', (err) => assert.fail(err));
			stream.on('end', () => {
				assert.deepEqual(actual.sort(), expected);
				done();
			});
		});
	});
});
