import * as path from 'node:path';
import * as runner from '../runner.js';

runner.suite('Options Unique', {
	tests: [
		{
			pattern: ['./file.md', 'file.md', '*'],
			options: {
				cwd: 'fixtures',
				unique: false,
			},
		},
		{
			pattern: ['./file.md', 'file.md', '*'],
			options: {
				cwd: 'fixtures',
				unique: true,
			},
			// There's a race going on here. On some OS the values may float.
			resultTransform(entry) {
				return entry.replace('./', '');
			},
		},
	],
});

const ABSOLUTE_FIXTURES = path.resolve('fixtures').replaceAll('\\', '/');

runner.suite('Options Unique (absolute output)', {
	resultTransform(entry) {
		return entry.replaceAll('\\', '/').replace(ABSOLUTE_FIXTURES, '<root>/fixtures');
	},
	tests: [
		...[
			['file.md', `${ABSOLUTE_FIXTURES}/file.md`],
			[`${ABSOLUTE_FIXTURES}/file.md`, 'file.md'],
			['*.md', `${ABSOLUTE_FIXTURES}/*.md`],
			['file.md', `${ABSOLUTE_FIXTURES}/*.md`],
			['*.md', `${ABSOLUTE_FIXTURES}/file.md`],
			['file.md', 'first/../file.md'],
		].map((pattern) => ({
			pattern,
			options: { cwd: 'fixtures', absolute: true },
			expected: () => ['<root>/fixtures/file.md'],
		})),
		{
			pattern: ['file.md', `${ABSOLUTE_FIXTURES}/file.md`],
			options: { cwd: 'fixtures', absolute: true, unique: false },
			expected: () => ['<root>/fixtures/file.md', '<root>/fixtures/file.md'],
		},
		{
			pattern: ['file.md', `${ABSOLUTE_FIXTURES}/file.md`],
			options: { cwd: 'fixtures', absolute: false },
			expected: () => ['file.md', '<root>/fixtures/file.md'],
		},
	],
});
