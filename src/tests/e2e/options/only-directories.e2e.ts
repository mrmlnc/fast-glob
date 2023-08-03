import * as runner from '../runner';

runner.suite('Options OnlyDirectories', {
	tests: [
		{
			pattern: 'fixtures/*',
			options: {
				onlyDirectories: true,
			},
		},
		{
			pattern: 'fixtures/**',
			options: {
				onlyDirectories: true,
			},
		},
		{
			pattern: 'fixtures/**/*',
			options: {
				onlyDirectories: true,
			},
		},
		{
			pattern: 'fixtures/*/',
			options: {
				onlyDirectories: true,
			},
		},
		{
			pattern: 'fixtures/**/',
			options: {
				onlyDirectories: true,
			},
		},
		{
			pattern: 'fixtures/**/*/',
			options: {
				onlyDirectories: true,
			},
		},
	],
});

runner.suite('Options OnlyDirectories (cwd)', {
	tests: [
		{
			pattern: '*',
			options: {
				cwd: 'fixtures',
				onlyDirectories: true,
			},
		},
		{
			pattern: '**',
			options: {
				cwd: 'fixtures',
				onlyDirectories: true,
			},
		},
		{
			pattern: '**/*',
			options: {
				cwd: 'fixtures',
				onlyDirectories: true,
			},
		},
		{
			pattern: '*/',
			options: {
				cwd: 'fixtures',
				onlyDirectories: true,
			},
		},
		{
			pattern: '**/',
			options: {
				cwd: 'fixtures',
				onlyDirectories: true,
			},
		},
		{
			pattern: '**/*/',
			options: {
				cwd: 'fixtures',
				onlyDirectories: true,
			},
		},
	],
});
