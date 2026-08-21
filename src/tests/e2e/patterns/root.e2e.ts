import * as path from 'node:path';
import * as fs from 'node:fs';

import * as runner from '../runner';
import * as utils from '../..';

const CWD = process.cwd().replaceAll('\\', '/');
const ROOT = path.parse(CWD).root;

function getRootEntries(root: string, withBase: boolean = false): string[] {
	let result = getRootEntriesWithFileTypes(root);

	if (withBase) {
		const separator = root.endsWith('/') ? '' : '/';

		result = result.map((item) => `${root}${separator}${item}`);
	}

	return result;
}

function getRootEntriesWithFileTypes(root: string): string[] {
	return fs.readdirSync(root, { withFileTypes: true })
		.filter((item) => !item.name.startsWith('.'))
		.filter((item) => !item.isDirectory())
		.map((item) => item.name);
}

runner.suite('Patterns Root', {
	tests: [
		{
			pattern: '/*',
			options: { followSymbolicLinks: false },
			condition: () => !utils.platform.isWindows(),
			expected: () => getRootEntries(ROOT, /** withBase */ true),
		},
		{
			pattern: '/usr/*',
			condition: () => !utils.platform.isWindows(),
			expected: () => getRootEntries('/usr', /** withBase */ true),
		},
		{
			pattern: '/*',
			condition: () => utils.platform.isWindows(),
			expected: () => getRootEntries('/', /** withBase */ true),
		},
		// UNC pattern without dynamic sections in the base section
		{
			pattern: `//?/${ROOT}*`,
			condition: () => utils.platform.isWindows(),
			expected: () => getRootEntries(`//?/${ROOT}`, /** withBase */ true),
		},
	],
});

runner.suite('Patterns Root (cwd)', {
	tests: [
		{
			pattern: '*',
			options: {
				cwd: ROOT,
				followSymbolicLinks: false,
			},
			condition: () => !utils.platform.isWindows(),
			expected: () => getRootEntries(ROOT),
		},
		// UNC on Windows
		{
			pattern: '*',
			options: {
				cwd: `//?/${ROOT}`,
			},
			condition: () => utils.platform.isWindows(),
			expected: () => getRootEntries(`//?/${ROOT}`),
		},
	],
});

runner.suite('Patterns Root (mix of absolute and relative patterns)', {
	tests: [
		// The absolute pattern must not be merged into the global task rooted at the current
		// directory, otherwise its entries will never match and will be silently dropped.
		{
			pattern: [`${CWD}/fixtures/first/*.md`, '*.md'],
			options: { cwd: 'fixtures' },
			issue: 497,
			expected: () => [`${CWD}/fixtures/first/file.md`, 'file.md'],
		},
	],
});
