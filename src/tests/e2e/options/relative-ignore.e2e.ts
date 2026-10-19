import * as path from 'node:path';
import * as fg from '../../../index.js';
import * as runner from '../runner.js';

const cwd = path.resolve('fixtures');
const root = fg.convertPathToPattern(cwd);
const absolute = (name: string): string => path.join(cwd, name).replaceAll('\\', '/');
const files = ['first/file.md', 'first/nested/file.md', 'first/nested/directory/file.md'];

runner.suite('Relative ignore with absolute patterns', {
	resultTransform: (entry) => entry.replaceAll('\\', '/'),
	tests: [
		{
			pattern: `${root}/first/file.md`,
			options: { cwd, ignore: ['**/fixtures/**'] },
			expected: () => [absolute('first/file.md')],
			issue: 538,
		},
		{
			pattern: `${root}/first/**/*.md`,
			options: { cwd, ignore: ['**/fixtures/**'] },
			expected: () => files.map((name) => absolute(name)),
			issue: 538,
		},
		{
			pattern: `${root}/first/file.md`,
			options: { cwd, ignore: ['first/file.md'] },
			expected: () => [],
			issue: 538,
		},
		{
			pattern: `${root}/first/**/*.md`,
			options: { cwd, ignore: ['first/nested/**'] },
			expected: () => [absolute('first/file.md')],
			issue: 538,
		},
		{
			pattern: `${root}/first/**/*.md`,
			options: { cwd, ignore: [`${root}/first/nested/**`] },
			expected: () => [absolute('first/file.md')],
		},
		{
			pattern: 'first/**/*.md',
			options: { cwd, ignore: ['first/nested/**', '**/fixtures/**'] },
			expected: () => ['first/file.md'],
		},
		{
			pattern: [`${root}/first/file.md`, 'file.md'],
			options: { cwd, absolute: true, ignore: ['**/fixtures/**'] },
			expected: () => [absolute('first/file.md'), absolute('file.md')],
			issue: 538,
		},
		{
			pattern: `${root}/first/nested`,
			options: { cwd, onlyDirectories: true, ignore: ['first/nested/'] },
			expected: () => [],
		},
		{
			pattern: 'first/**/*.md',
			options: { cwd, ignore: [`${root}/first/nested/**`] },
			expected: () => ['first/file.md'],
		},
	],
});
