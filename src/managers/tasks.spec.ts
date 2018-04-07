import * as assert from 'assert';

import * as optionsManager from './options';
import * as manager from './tasks';

import { PatternsGroup } from '../types/patterns';
import { ITask } from './tasks';

describe('Managers → Task', () => {
	describe('.generate', () => {
		it('should return task with windows-like patterns', () => {
			const options = optionsManager.prepare();

			const expected: ITask[] = [{
				base: 'a',
				dynamic: true,
				patterns: ['a/*'],
				positive: ['a/*'],
				negative: []
			}];

			const actual = manager.generate(['a\\*'], options);

			assert.deepEqual(actual, expected);
		});

		it('should return task with negative patterns from «ignore» option', () => {
			const options = optionsManager.prepare({ ignore: ['*.txt'] });

			const expected: ITask[] = [{
				base: 'a',
				dynamic: true,
				patterns: ['a/*', '!*.md', '!*.txt'],
				positive: ['a/*'],
				negative: ['*.md', '*.txt']
			}];

			const actual = manager.generate(['a/*', '!*.md'], options);

			assert.deepEqual(actual, expected);
		});

		it('should return static and dynamic tasks', () => {
			const options = optionsManager.prepare({ ignore: ['*.txt'] });

			const expected: ITask[] = [
				{
					base: 'a',
					dynamic: false,
					patterns: ['a/file.json', '!*.txt'],
					positive: ['a/file.json'],
					negative: ['*.txt']
				},
				{
					base: 'b',
					dynamic: true,
					patterns: ['b/*', '!b/*.md', '!*.txt'],
					positive: ['b/*'],
					negative: ['b/*.md', '*.txt']
				}
			];

			const actual = manager.generate(['a/file.json', 'b/*', '!b/*.md'], options);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.convertPatternsToTasks', () => {
		it('should return global task when positive patterns have a global pattern', () => {
			const expected: ITask[] = [{
				base: '.',
				dynamic: true,
				patterns: ['*', '!*.md'],
				positive: ['*'],
				negative: ['*.md']
			}];

			const actual = manager.convertPatternsToTasks(['*'], ['*.md'], /* dynamic */ true);

			assert.deepEqual(actual, expected);
		});

		it('should return global task with negative patterns from «ignore» patterns', () => {
			const expected: ITask[] = [{
				base: '.',
				dynamic: true,
				patterns: ['*', '!*.md'],
				positive: ['*'],
				negative: ['*.md']
			}];

			const actual = manager.convertPatternsToTasks(['*'], ['*.md'], /* dynamic */ true);

			assert.deepEqual(actual, expected);
		});

		it('should return two tasks', () => {
			const expected: ITask[] = [
				{
					base: 'a',
					dynamic: true,
					patterns: ['a/*'],
					positive: ['a/*'],
					negative: []
				},
				{
					base: 'b',
					dynamic: true,
					patterns: ['b/*', '!b/*.md'],
					positive: ['b/*'],
					negative: ['b/*.md']
				}
			];

			const actual = manager.convertPatternsToTasks(['a/*', 'b/*'], ['b/*.md'], /* dynamic */ true);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.getPositivePatterns', () => {
		it('should return only positive patterns', () => {
			const expected = ['*'];

			const actual = manager.getPositivePatterns(['*', '!*.md']);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.getNegativePatternsAsPositive', () => {
		it('should return negative patterns as positive', () => {
			const expected = ['*.md'];

			const actual = manager.getNegativePatternsAsPositive(['*', '!*.md'], []);

			assert.deepEqual(actual, expected);
		});

		it('should return negative patterns as positive with patterns from ignore option', () => {
			const expected = ['*.md', '*.txt', '*.json'];

			const actual = manager.getNegativePatternsAsPositive(['*', '!*.md'], ['*.txt', '!*.json']);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.groupPatternsByBaseDirectory', () => {
		it('should return empty object', () => {
			const expected: PatternsGroup = {};

			const actual = manager.groupPatternsByBaseDirectory([]);

			assert.deepEqual(actual, expected);
		});

		it('should return grouped patterns', () => {
			const expected: PatternsGroup = {
				'.': ['*'],
				a: ['a/*']
			};

			const actual = manager.groupPatternsByBaseDirectory(['*', 'a/*']);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.convertPatternGroupToTask', () => {
		it('should return created dynamic task', () => {
			const expected: ITask = {
				base: '.',
				dynamic: true,
				patterns: ['*', '!*.md'],
				positive: ['*'],
				negative: ['*.md']
			};

			const actual = manager.convertPatternGroupToTask('.', ['*'], ['*.md'], /* dynamic */ true);

			assert.deepEqual(actual, expected);
		});

		it('should return created static task', () => {
			const expected: ITask = {
				base: '.',
				dynamic: false,
				patterns: ['file', '!file.md'],
				positive: ['file'],
				negative: ['file.md']
			};

			const actual = manager.convertPatternGroupToTask('.', ['file'], ['file.md'], /* dynamic */ false);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.convertPatternGroupsToTasks', () => {
		it('should return one task without negative patterns', () => {
			const expected: ITask[] = [{
				base: 'a',
				dynamic: true,
				patterns: ['a/*'],
				positive: ['a/*'],
				negative: []
			}];

			const actual = manager.convertPatternGroupsToTasks({ a: ['a/*'] }, {}, /* dynamic */ true);

			assert.deepEqual(actual, expected);
		});

		it('should return one task without unused negative patterns', () => {
			const expected: ITask[] = [{
				base: 'a',
				dynamic: true,
				patterns: ['a/*'],
				positive: ['a/*'],
				negative: []
			}];

			const actual = manager.convertPatternGroupsToTasks({ a: ['a/*'] }, { b: ['b/*'] }, /* dynamic */ true);

			assert.deepEqual(actual, expected);
		});

		it('should return one task with local and global negative patterns', () => {
			const expected: ITask[] = [{
				base: 'a',
				dynamic: true,
				patterns: ['a/*', '!a/*.txt', '!*.md'],
				positive: ['a/*'],
				negative: ['a/*.txt', '*.md']
			}];

			const actual = manager.convertPatternGroupsToTasks({ a: ['a/*'] }, { '.': ['*.md'], a: ['a/*.txt'] }, /* dynamic */ true);

			assert.deepEqual(actual, expected);
		});

		it('should return two tasks with negative patterns for only one task', () => {
			const expected: ITask[] = [
				{
					base: 'a',
					dynamic: true,
					patterns: ['a/*'],
					positive: ['a/*'],
					negative: []
				},
				{
					base: 'b',
					dynamic: true,
					patterns: ['b/*', '!b/*.md'],
					positive: ['b/*'],
					negative: ['b/*.md']
				}
			];

			const actual = manager.convertPatternGroupsToTasks({ a: ['a/*'], b: ['b/*'] }, { b: ['b/*.md'] }, /* dynamic */ true);

			assert.deepEqual(actual, expected);
		});

		it('should return two tasks with local and global negative patterns', () => {
			const expected: ITask[] = [
				{
					base: 'a',
					dynamic: true,
					patterns: ['a/*', '!*.md'],
					positive: ['a/*'],
					negative: ['*.md']
				},
				{
					base: 'b',
					dynamic: true,
					patterns: ['b/*', '!*.md'],
					positive: ['b/*'],
					negative: ['*.md']
				}
			];

			const actual = manager.convertPatternGroupsToTasks({ a: ['a/*'], b: ['b/*'] }, { '.': ['*.md'] }, /* dynamic */ true);

			assert.deepEqual(actual, expected);
		});
	});
});
