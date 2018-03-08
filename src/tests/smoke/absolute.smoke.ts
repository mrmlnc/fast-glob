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
