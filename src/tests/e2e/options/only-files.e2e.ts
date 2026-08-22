import * as runner from '../runner.js';

runner.suite('Options OnlyFiles', {
	tests: [
		{
			pattern: 'fixtures/*',
			options: {
				onlyFiles: true,
			},
		},
		{
			pattern: 'fixtures/**',
			options: {
				onlyFiles: true,
			},
		},
		{
			pattern: 'fixtures/**/*',
			options: {
				onlyFiles: true,
			},
		},
	],
});

runner.suite('Options Files (cwd)', {
	tests: [
		{
			pattern: '*',
			options: {
				cwd: 'fixtures',
				onlyFiles: true,
			},
		},
		{
			pattern: '**',
			options: {
				cwd: 'fixtures',
				onlyFiles: true,
			},
		},
		{
			pattern: '**/*',
			options: {
				cwd: 'fixtures',
				onlyFiles: true,
			},
		},
	],
});
