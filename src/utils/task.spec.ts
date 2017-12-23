import * as assert from 'assert';

import * as task from './task';

describe('Utils/Task', () => {

	it('Should work with patterns without the parent path', () => {
		const tasks = task.generateTasks(['**/*', '!**/*.txt'], { ignore: [] });
		assert.deepEqual(tasks, [
			{ base: '.', patterns: ['**/*', '!**/*.txt'] }
		]);
	});

	it('Should returns a single task', () => {
		const tasks = task.generateTasks(['dir/**/*', '!dir/**/*.txt'], { ignore: [] });
		assert.deepEqual(tasks, [
			{ base: 'dir', patterns: ['dir/**/*', '!dir/**/*.txt'] }
		]);
	});

	it('Should return two tasks', () => {
		const tasks = task.generateTasks(['one/**/*', 'two/**/*', '!**/*.txt'], { ignore: [] });
		assert.deepEqual(tasks, [
			{ base: 'one', patterns: ['one/**/*', '!one/**/*.txt'] },
			{ base: 'two', patterns: ['two/**/*', '!two/**/*.txt'] }
		]);
	});

	it('Should return a single task with patterns from options.ignore', () => {
		const tasks = task.generateTasks(['dir/**/*', '!dir/**/*.txt'], { ignore: ['**/*.txt'] });
		assert.deepEqual(tasks, [
			{ base: 'dir', patterns: ['dir/**/*', '!dir/**/*.txt'] }
		]);
	});

});
