import * as path from 'path';

import * as smoke from './smoke';

smoke.suite('Smoke → Absolute', [
	{
		pattern: 'fixtures/*',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},
	{
		pattern: 'fixtures/**',
		globOptions: { absolute: true },
		fgOptions: { absolute: true },
		broken: true,
		issue: 47
	},
	{
		pattern: 'fixtures/**/*',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},
	{
		pattern: 'fixtures/../*',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	}
]);

smoke.suite('Smoke → Absolute (ignore)', [
	{
		pattern: 'fixtures/*/*',
		ignore: 'fixtures/*/nested',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},
	{
		pattern: 'fixtures/*/*',
		ignore: '**/nested',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},

	{
		pattern: 'fixtures/*',
		ignore: path.join(process.cwd(), 'fixtures', '*'),
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},
	{
		pattern: 'fixtures/**',
		ignore: path.join(process.cwd(), 'fixtures', '*'),
		globOptions: { absolute: true },
		fgOptions: { absolute: true },
		broken: true,
		issue: 47
	}
]);

smoke.suite('Smoke → Absolute (cwd)', [
	{
		pattern: '*',
		cwd: 'fixtures',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},
	{
		pattern: '**',
		cwd: 'fixtures',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},
	{
		pattern: '**/*',
		cwd: 'fixtures',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	}
]);

smoke.suite('Smoke → Absolute (cwd & ignore)', [
	{
		pattern: '*/*',
		ignore: '*/nested',
		cwd: 'fixtures',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},
	{
		pattern: '*/*',
		ignore: '**/nested',
		cwd: 'fixtures',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},

	{
		pattern: '*',
		ignore: path.join(process.cwd(), 'fixtures', '*'),
		cwd: 'fixtures',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},
	{
		pattern: '**',
		ignore: path.join(process.cwd(), 'fixtures', '*'),
		cwd: 'fixtures',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	},
	{
		pattern: '**',
		ignore: path.join(process.cwd(), 'fixtures', '**'),
		cwd: 'fixtures',
		globOptions: { absolute: true },
		fgOptions: { absolute: true }
	}
]);
