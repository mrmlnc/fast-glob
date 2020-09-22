import * as smoke from './smoke';

smoke.suite('Smoke → Directories', [
	{
		pattern: 'fixtures/*',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	},
	{
		pattern: 'fixtures/**',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	},
	{
		pattern: 'fixtures/**/*',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	},
	{
		pattern: 'fixtures/*/',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	},
	{
		pattern: 'fixtures/**/',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	},
	{
		pattern: 'fixtures/**/*/',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	}
]);

smoke.suite('Smoke → Directories (cwd)', [
	{
		pattern: '*',
		cwd: 'fixtures',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	},
	{
		pattern: '**',
		cwd: 'fixtures',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	},
	{
		pattern: '**/*',
		cwd: 'fixtures',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	},
	{
		pattern: '*/',
		cwd: 'fixtures',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	},
	{
		pattern: '**/',
		cwd: 'fixtures',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	},
	{
		pattern: '**/*/',
		cwd: 'fixtures',
		globOptions: { },
		fgOptions: { onlyDirectories: true }
	}
]);
