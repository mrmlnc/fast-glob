import * as runner from '../runner.js';

runner.suite('Options MatchBase', {
	tests: [
		{
			pattern: 'file.md',
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
			},
		},
		{
			pattern: 'first/*/file.md',
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
			},
		},
		{
			pattern: 'first/**/file.md',
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
			},
		},
		{
			pattern: ['*.md', '!file.md'],
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
			},
			expected: () => ['third/library/a/book.md', 'third/library/b/book.md'],
		},
		{
			pattern: ['*.md', '!*.md'],
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
			},
			expected: () => [],
		},
		{
			pattern: ['*.md'],
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
				ignore: ['!file.md'],
			},
			expected: () => ['third/library/a/book.md', 'third/library/b/book.md'],
		},
		{
			pattern: ['*.md'],
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
				ignore: ['file.md'],
			},
			expected: () => ['third/library/a/book.md', 'third/library/b/book.md'],
		},
		{
			pattern: '!(file).md',
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
			},
			expected: () => ['third/library/a/book.md', 'third/library/b/book.md'],
		},
	],
});
