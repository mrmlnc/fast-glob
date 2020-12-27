import * as path from 'path';

import * as smoke from './smoke';
import * as utils from '..';

const CWD = process.cwd().replace(/\\/g, '/');
const ROOT = path.parse(CWD).root;

smoke.suite('Smoke → Root', [
	{
		pattern: '/*',
		condition: () => !utils.platform.isWindows()
	},
	{
		pattern: '/tmp/*',
		condition: () => !utils.platform.isWindows()
	},
	{
		pattern: '/*',
		condition: () => utils.platform.isSupportReaddirWithFileTypes() && utils.platform.isWindows(),
		correct: true,
		reason: 'The `node-glob` packages returns items with resolve path for the current disk letter'
	},
	// UNC pattern without dynamic sections in the base section
	{
		pattern: `//?/${ROOT}*`,
		condition: () => utils.platform.isSupportReaddirWithFileTypes() && utils.platform.isWindows(),
		correct: true,
		reason: 'The `node-glob` package does not allow to use UNC in patterns'
	}
]);

smoke.suite('Smoke → Root (cwd)', [
	{
		pattern: '*',
		cwd: ROOT,
		condition: () => !utils.platform.isWindows() || utils.platform.isSupportReaddirWithFileTypes()
	},
	// UNC on Windows
	{
		pattern: '*',
		cwd: `//?/${ROOT}`,
		condition: () => utils.platform.isSupportReaddirWithFileTypes() && utils.platform.isWindows()
	}
]);
