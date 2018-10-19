import * as assert from 'assert';

import * as pkg from './index';

import { ITask } from './managers/tasks';
import { EntryItem } from './types/entries';

describe('Package', () => {
	describe('.sync', () => {
		it('should returns entries', () => {
			const expected: EntryItem[] = [
				'fixtures/file.md',
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual = pkg.sync(['fixtures/**/*.md']);

			assert.deepStrictEqual(actual.sort(), expected);
		});

		it('should returns entries (two sources)', () => {
			const expected: EntryItem[] = [
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual = pkg.sync(['fixtures/first/**/*.md', 'fixtures/second/**/*.md']);

			assert.deepStrictEqual(actual.sort(), expected);
		});
	});

	describe('.async', () => {
		it('should returns entries', async () => {
			const expected: EntryItem[] = [
				'fixtures/file.md',
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual = await pkg.async(['fixtures/**/*.md']);

			assert.deepStrictEqual(actual.sort(), expected);
		});

		it('should returns entries (two sources)', async () => {
			const expected: EntryItem[] = [
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual = await pkg.async(['fixtures/first/**/*.md', 'fixtures/second/**/*.md']);

			assert.deepStrictEqual(actual.sort(), expected);
		});
	});

	describe('.stream', () => {
		it('should returns entries', (done) => {
			const expected: EntryItem[] = [
				'fixtures/file.md',
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual: EntryItem[] = [];

			const stream = pkg.stream(['fixtures/**/*.md']);

			stream.on('data', (entry) => actual.push(entry));
			stream.on('error', (err) => assert.fail(err));
			stream.on('end', () => {
				assert.deepStrictEqual(actual.sort(), expected);
				done();
			});
		});

		it('should returns entries (two sources)', (done) => {
			const expected: EntryItem[] = [
				'fixtures/first/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/second/nested/file.md'
			];

			const actual: EntryItem[] = [];

			const stream = pkg.stream(['fixtures/first/**/*.md', 'fixtures/second/**/*.md']);

			stream.on('data', (entry) => actual.push(entry));
			stream.on('error', (err) => assert.fail(err));
			stream.on('end', () => {
				assert.deepStrictEqual(actual.sort(), expected);
				done();
			});
		});
	});

	describe('.generateTasks', () => {
		it('should return tasks', () => {
			const expected: ITask[] = [{
				base: '.',
				dynamic: true,
				patterns: ['*'],
				positive: ['*'],
				negative: []
			}];

			const actual = pkg.generateTasks(['*']);

			assert.deepStrictEqual(actual, expected);
		});

		it('should return tasks with negative patterns', () => {
			const expected: ITask[] = [{
				base: '.',
				dynamic: true,
				patterns: ['*', '!*.txt', '!*.md'],
				positive: ['*'],
				negative: ['*.txt', '*.md']
			}];

			const actual = pkg.generateTasks(['*', '!*.txt'], { ignore: ['*.md'] });

			assert.deepStrictEqual(actual, expected);
		});
	});
});
