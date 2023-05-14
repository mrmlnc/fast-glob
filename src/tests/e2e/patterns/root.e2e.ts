import * as path from 'path';
import * as fs from 'fs';

import * as runner from '../runner';
import * as utils from '../..';

const CWD = process.cwd().replace(/\\/g, '/');
const ROOT = path.parse(CWD).root;

function getRootEntries(root: string, withBase: boolean = false): string[] {
	let result: string[] = [];

	if (utils.platform.isSupportReaddirWithFileTypes()) {
		result = getRootEntriesWithFileTypes(root);
	} else {
		result = getRootEntriesWithStatsCall(root);
	}

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

function getRootEntriesWithStatsCall(root: string): string[] {
	return fs.readdirSync(root)
		.filter((item) => !item.startsWith('.'))
		.filter((item) => fs.lstatSync(`${root}/${item}`).isFile());
}

runner.suite('Patterns Root', {
	tests: [
		{
			pattern: '/*',
			condition: () => !utils.platform.isWindows(),
			expected: () => getRootEntries(ROOT)
		},
		{
			pattern: '/tmp/*',
			condition: () => !utils.platform.isWindows(),
			expected: () => getRootEntries('/tmp', /** withBase */ true)
		},
		{
			pattern: '/*',
			condition: () => utils.platform.isSupportReaddirWithFileTypes() && utils.platform.isWindows(),
			expected: () => getRootEntries('/', /** withBase */ true)
		},
		// UNC pattern without dynamic sections in the base section
		{
			pattern: `//?/${ROOT}*`,
			condition: () => utils.platform.isSupportReaddirWithFileTypes() && utils.platform.isWindows(),
			expected: () => getRootEntries(`//?/${ROOT}`, /** withBase */ true)
		}
	]
});

runner.suite('Patterns Root (cwd)', {
	tests: [
		{
			pattern: '*',
			options: {
				cwd: ROOT
			},
			condition: () => !utils.platform.isWindows() || utils.platform.isSupportReaddirWithFileTypes(),
			expected: () => getRootEntries(ROOT)
		},
		// UNC on Windows
		{
			pattern: '*',
			options: {
				cwd: `//?/${ROOT}`
			},
			condition: () => utils.platform.isSupportReaddirWithFileTypes() && utils.platform.isWindows(),
			expected: () => getRootEntries(`//?/${ROOT}`)
		}
	]
});
