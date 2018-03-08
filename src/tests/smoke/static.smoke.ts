import * as smoke from './smoke';

smoke.suite('Smoke → Static', [
	{ pattern: 'fixtures' },
	{ pattern: 'fixtures/file.md' },
	{ pattern: 'fixtures/first' }
]);

smoke.suite('Smoke → Static (cwd)', [
	{ pattern: 'file.md', cwd: 'fixtures' },
	{ pattern: 'first', cwd: 'fixtures' }
]);

smoke.suite('Smoke → Static (ignore)', [
	// Files
	[
		{ pattern: 'fixtures/file.md', ignore: 'file.md' },
		{ pattern: 'fixtures/file.md', ignore: '*.md' },
		{ pattern: 'fixtures/file.md', ignore: '*' },
		{ pattern: 'fixtures/file.md', ignore: '**' },
		{ pattern: 'fixtures/file.md', ignore: '**/*' },
		{ pattern: 'fixtures/file.md', ignore: 'fixtures/file.md' },
		{ pattern: 'fixtures/file.md', ignore: 'fixtures/*.md' },
		{ pattern: 'fixtures/file.md', ignore: 'fixtures/*' },
		{ pattern: 'fixtures/file.md', ignore: 'fixtures/**', broken: true, issue: 69 },
		{ pattern: 'fixtures/file.md', ignore: 'fixtures/**/*' }
	],

	// Directories
	[
		{ pattern: 'fixtures/first', ignore: 'first' },
		{ pattern: 'fixtures/first', ignore: '*' },
		{ pattern: 'fixtures/first', ignore: '**' },
		{ pattern: 'fixtures/first', ignore: '**/*' },
		{ pattern: 'fixtures/first', ignore: 'fixtures/first', broken: true, issue: 69 },
		{ pattern: 'fixtures/first', ignore: 'fixtures/*' },
		{ pattern: 'fixtures/first', ignore: 'fixtures/**', broken: true, issue: 69 },
		{ pattern: 'fixtures/first', ignore: 'fixtures/**/*' }
	]
]);

smoke.suite('Smoke → Static (ignore & cwd)', [
	// Files
	[
		{ pattern: 'fixtures/file.md', ignore: 'file.md', cwd: 'fixtures' },
		{ pattern: 'fixtures/file.md', ignore: '*.md', cwd: 'fixtures' },
		{ pattern: 'fixtures/file.md', ignore: '*', cwd: 'fixtures' },
		{ pattern: 'fixtures/file.md', ignore: '**', cwd: 'fixtures' },
		{ pattern: 'fixtures/file.md', ignore: '**/*', cwd: 'fixtures' }
	],

	// Directories
	[
		{ pattern: 'fixtures/first', ignore: 'first', cwd: 'fixtures' },
		{ pattern: 'fixtures/first', ignore: '*', cwd: 'fixtures' },
		{ pattern: 'fixtures/first', ignore: '**', cwd: 'fixtures' },
		{ pattern: 'fixtures/first', ignore: '**/*', cwd: 'fixtures' }
	]
]);
