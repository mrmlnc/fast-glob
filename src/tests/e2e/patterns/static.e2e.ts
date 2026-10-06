import * as runner from '../runner.js';

runner.suite('Patterns Static', {
	tests: [
		{ pattern: 'fixtures' },
		{ pattern: 'fixtures/file.md' },
		{ pattern: 'fixtures/first' },
	],
});

runner.suite('Patterns Static (cwd)', {
	tests: [
		{ pattern: 'file.md', options: { cwd: 'fixtures' } },
		{ pattern: 'first', options: { cwd: 'fixtures' } },
	],
});

runner.suite('Patterns Static (trailing slash)', {
	tests: [
		{
			pattern: 'fixtures/file.md/',
			issue: 458,
			expected: () => [],
		},
		{
			pattern: 'fixtures/file.md/',
			options: { onlyFiles: false },
			issue: 458,
			expected: () => [],
		},
		{
			pattern: 'file.md/',
			options: { cwd: 'fixtures', onlyFiles: false },
			expected: () => [],
		},
		{
			pattern: 'fixtures/*.md/',
			options: { onlyFiles: false },
			expected: () => [],
		},
		{
			pattern: 'fixtures/first/',
			options: { onlyFiles: false },
			expected: () => ['fixtures/first/'],
		},
		{
			pattern: ['fixtures/file.md/', 'fixtures/file.md'],
			expected: () => ['fixtures/file.md'],
		},
		{
			pattern: ['fixtures/file.md', 'fixtures/file.md/'],
			options: { unique: false },
			expected: () => ['fixtures/file.md'],
		},
		{
			pattern: ['fixtures/file.md/', 'fixtures/first/'],
			options: { onlyFiles: false },
			expected: () => ['fixtures/first/'],
		},
		{
			pattern: ['fixtures/file.md', '!fixtures/file.md/'],
			expected: () => ['fixtures/file.md'],
		},
		{
			pattern: 'fixtures/first/',
			options: { onlyFiles: false, ignore: ['fixtures/first/'] },
			expected: () => [],
		},
	],
});

runner.suite('Patterns Static (ignore)', {
	tests: [
		// Files
		[
			{ pattern: 'fixtures/file.md', options: { ignore: ['file.md'] } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['*.md'] } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['fixtures/file.md'] } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['fixtures/*.md'] } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['fixtures/*'] } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['fixtures/**'] } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['fixtures/**/*'] } },
		],

		// Directories
		[
			{ pattern: 'fixtures/first', options: { ignore: ['first'] } },
			{ pattern: 'fixtures/first', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/first', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/first', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/first', options: { ignore: ['fixtures/first'] } },
			{ pattern: 'fixtures/first', options: { ignore: ['fixtures/*'] } },
			{ pattern: 'fixtures/first', options: { ignore: ['fixtures/**'] } },
			{ pattern: 'fixtures/first', options: { ignore: ['fixtures/**/*'] } },
		],
	],
});

runner.suite('Patterns Static (ignore & cwd)', {
	tests: [
		// Files
		[
			{ pattern: 'fixtures/file.md', options: { ignore: ['file.md'], cwd: 'fixtures' } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['*.md'], cwd: 'fixtures' } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: 'fixtures/file.md', options: { ignore: ['**/*'], cwd: 'fixtures' } },
		],

		// Directories
		[
			{ pattern: 'fixtures/first', options: { ignore: ['first'], cwd: 'fixtures' } },
			{ pattern: 'fixtures/first', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: 'fixtures/first', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: 'fixtures/first', options: { ignore: ['**/*'], cwd: 'fixtures' } },
		],
	],
});

runner.suite('Patterns Static (relative)', {
	tests: [
		{ pattern: '../file.md', options: { cwd: 'fixtures/first' } },
		{ pattern: '../../file.md', options: { cwd: 'fixtures/first/nested' } },
	],
});
