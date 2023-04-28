import * as path from 'path';
import * as fs from 'fs';

import * as runner from '../runner';
import * as utils from '../..';

const CWD = process.cwd().replace(/\\/g, '/');
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
		.filter((item) => item.isFile())
		.map((item) => item.name);
}

runner.suite('Patterns Root', {
	tests: [
		{
			pattern: '/*',
			condition: () => !utils.platform.isWindows(),
			expected: () => getRootEntries(ROOT, /** withBase */ true),
		},
		{
			pattern: '/tmp/*',
			condition: () => !utils.platform.isWindows(),
			expected: () => getRootEntries('/tmp', /** withBase */ true),
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
