import * as assert from 'assert';

import * as optionsManager from './options';
import * as manager from './tasks';

import { PatternsGroup } from '../types/patterns';
import { ITask, TaskGroup } from './tasks';

describe('Managers → Task', () => {
	describe('.groupPatternsByParentDirectory', () => {
		it('should returns grouped patterns by base directory', () => {
			const expected: PatternsGroup = {
				'.': ['*.js'],
				root: ['root/*.md']
			};

			const actual = manager.groupPatternsByParentDirectory(['*.js', 'root/*.md']);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.makePositiveTaskGroup', () => {
		it('should returns positive task group', () => {
			const expected: TaskGroup = {
				a: {
					base: 'a',
					patterns: ['a/*.txt', 'a/*.md'],
					positive: ['a/*.txt', 'a/*.md'],
					negative: []
				}
			};

			const actual = manager.makePositiveTaskGroup({ a: ['a/*.txt', 'a/*.md'] });

			assert.deepEqual(actual, expected);
		});
	});

	describe('.makeNegativeTaskGroup', () => {
		it('should returns positive task group', () => {
			const expected: TaskGroup = {
				a: {
					base: 'a',
					patterns: ['!a/*.txt', '!a/*.md'],
					positive: [],
					negative: ['a/*.txt', 'a/*.md']
				}
			};

			const actual = manager.makeNegativeTaskGroup({ a: ['a/*.txt', 'a/*.md'] });

			assert.deepEqual(actual, expected);
		});
	});

	describe('.mergeTaskGroups', () => {
		it('should returns merged positive and negative task group', () => {
			const positive: TaskGroup = {
				a: {
					base: 'a',
					patterns: ['a/**/*'],
					positive: ['a/**/*'],
					negative: []
				}
			};

			const negative: TaskGroup = {
				a: {
					base: 'a',
					patterns: ['!a/**/*.txt'],
					positive: [],
					negative: ['a/**/*.txt']
				}
			};

			const expected: TaskGroup = {
				a: {
					base: 'a',
					patterns: ['a/**/*', '!a/**/*.txt'],
					positive: ['a/**/*'],
					negative: ['a/**/*.txt']
				}
			};

			const actual = manager.mergeTaskGroups(positive, negative);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.makeTasks', () => {
		it('should returns tasks', () => {
			const expected: ITask[] = [{
				base: 'a',
				patterns: ['a/**/*', '!a/**/*.txt'],
				positive: ['a/**/*'],
				negative: ['a/**/*.txt']
			}];

			const actual = manager.makeTasks({ a: ['a/**/*'] }, { a: ['a/**/*.txt'] });

			assert.deepEqual(actual, expected);
		});
	});

	describe('.generate', () => {
		it('should returns empty array for provided only negative patterns', () => {
			const expected: ITask[] = [];

			const options = optionsManager.prepare();
			const actual = manager.generate(['!**/*'], options);

			assert.deepEqual(actual, expected);
		});

		describe('Global Task', () => {
			it('should returns one global task', () => {
				const expected: manager.ITask[] = [{
					base: '.',
					patterns: ['**/*'],
					positive: ['**/*'],
					negative: []
				}];

				const options = optionsManager.prepare({ ignore: [] });
				const actual = manager.generate(['**/*'], options);

				assert.deepEqual(actual, expected);
			});

			it('should returns one global task with negative patterns', () => {
				const expected: manager.ITask[] = [{
					base: '.',
					patterns: ['**/*', '!**/*.md'],
					positive: ['**/*'],
					negative: ['**/*.md']
				}];

				const options = optionsManager.prepare({ ignore: [] });
				const actual = manager.generate(['**/*', '!**/*.md'], options);

				assert.deepEqual(actual, expected);
			});

			it('should returns one global task with negative patterns from options', () => {
				const expected: manager.ITask[] = [{
					base: '.',
					patterns: ['**/*', '!**/*.md'],
					positive: ['**/*'],
					negative: ['**/*.md']
				}];

				const options = optionsManager.prepare({ ignore: ['**/*.md'] });
				const actual = manager.generate(['**/*'], options);

				assert.deepEqual(actual, expected);
			});
		});

		describe('Task', () => {
			it('should returns one task', () => {
				const expected: manager.ITask[] = [{
					base: 'a',
					patterns: ['a/**/*'],
					positive: ['a/**/*'],
					negative: []
				}];

				const options = optionsManager.prepare({ ignore: [] });
				const actual = manager.generate(['a/**/*'], options);

				assert.deepEqual(actual, expected);
			});

			it('should returns one task with negative patterns', () => {
				const expected: manager.ITask[] = [{
					base: 'a',
					patterns: ['a/**/*', '!a/*.md'],
					positive: ['a/**/*'],
					negative: ['a/*.md']
				}];

				const options = optionsManager.prepare({ ignore: [] });
				const actual = manager.generate(['a/**/*', '!a/*.md'], options);

				assert.deepEqual(actual, expected);
			});

			it('should returns one task without unused negative patterns', () => {
				const expected: manager.ITask[] = [{
					base: 'a',
					patterns: ['a/**/*'],
					positive: ['a/**/*'],
					negative: []
				}];

				const options = optionsManager.prepare({ ignore: [] });
				const actual = manager.generate(['a/**/*', '!b/*.md'], options);

				assert.deepEqual(actual, expected);
			});

			it('should returns one task with negative patterns from options', () => {
				const expected: manager.ITask[] = [{
					base: 'a',
					patterns: ['a/**/*', '!a/*.md'],
					positive: ['a/**/*'],
					negative: ['a/*.md']
				}];

				const options = optionsManager.prepare({ ignore: ['a/*.md'] });
				const actual = manager.generate(['a/**/*'], options);

				assert.deepEqual(actual, expected);
			});

			it('should returns one task with expanded negative patterns that ends with globstar', () => {
				const expected: manager.ITask[] = [{
					base: 'a',
					patterns: ['a/**/*', '!a'],
					positive: ['a/**/*'],
					negative: ['a']
				}];

				const options = optionsManager.prepare({ ignore: ['a/**'] });
				const actual = manager.generate(['a/**/*'], options);

				assert.deepEqual(actual, expected);
			});
		});

		describe('Tasks', () => {
			it('should returns two tasks', () => {
				const expected: manager.ITask[] = [
					{
						base: 'a',

						patterns: ['a/*', '!a/*.md'],
						positive: ['a/*'],
						negative: ['a/*.md']
					},
					{
						base: 'b',

						patterns: ['b/*'],
						positive: ['b/*'],
						negative: []
					}
				];

				const options = optionsManager.prepare({ ignore: [] });
				const actual = manager.generate(['a/*', '!a/*.md', 'b/*'], options);

				assert.deepEqual(actual, expected);
			});

			it('should returns two tasks with global base negative patterns', () => {
				const expected: manager.ITask[] = [
					{
						base: 'a',

						patterns: ['a/*', '!a/*.md', '!**/*.txt'],
						positive: ['a/*'],
						negative: ['a/*.md', '**/*.txt']
					},
					{
						base: 'b',

						patterns: ['b/*', '!**/*.txt'],
						positive: ['b/*'],
						negative: ['**/*.txt']
					}
				];

				const options = optionsManager.prepare({ ignore: [] });
				const actual = manager.generate(['a/*', '!a/*.md', 'b/*', '!**/*.txt'], options);

				assert.deepEqual(actual, expected);
			});

			it('should returns two tasks with global base negative patterns from options', () => {
				const expected: manager.ITask[] = [
					{
						base: 'a',

						patterns: ['a/*', '!a/*.md', '!**/*.txt'],
						positive: ['a/*'],
						negative: ['a/*.md', '**/*.txt']
					},
					{
						base: 'b',

						patterns: ['b/*', '!**/*.txt'],
						positive: ['b/*'],
						negative: ['**/*.txt']
					}
				];

				const options = optionsManager.prepare({ ignore: ['**/*.txt'] });
				const actual = manager.generate(['a/*', '!a/*.md', 'b/*'], options);

				assert.deepEqual(actual, expected);
			});
		});
	});
});
