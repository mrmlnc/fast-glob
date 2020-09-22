import * as smoke from './smoke';

smoke.suite('Smoke → Directories', [
	{
		pattern: 'fixtures/*',
		globOptions: { },
		fgOptions: { onlyFiles: false }
	},
	// {
	// 	pattern: 'fixtures/**',
	// 	globOptions: { },
	// 	fgOptions: { onlyFiles: false }
	// },
	{
		pattern: 'fixtures/**/*',
		globOptions: { },
		fgOptions: { onlyFiles: false }
	},
	{
		pattern: 'fixtures/*/',
		globOptions: { },
		fgOptions: { onlyDirectories: true, markDirectories: true }
	},
	{
		pattern: 'fixtures/**/',
		globOptions: { },
		fgOptions: { onlyDirectories: true, markDirectories: true }
	},
	{
		pattern: 'fixtures/**/*/',
		globOptions: { },
		fgOptions: { onlyDirectories: true, markDirectories: true }
	}
]);

smoke.suite('Smoke → Directories (cwd)', [
	{
		pattern: '*',
		cwd: 'fixtures',
		globOptions: { },
		fgOptions: { onlyFiles: false }
	},
	// 	{
	// 		pattern: '**',
	// 		cwd: 'fixtures',
	// 		globOptions: { },
	// 		fgOptions: { onlyDirectories: true }
	// 	},
	{
		pattern: '**/*',
		cwd: 'fixtures',
		globOptions: { },
		fgOptions: { onlyFiles: false }
	},
	{
		pattern: '*/',
		cwd: 'fixtures',
		globOptions: { },
		fgOptions: { onlyDirectories: true, markDirectories: true }
	},
	// 	{
	// 		pattern: '**/',
	// 		cwd: 'fixtures',
	// 		globOptions: { },
	// 		fgOptions: { onlyFiles: false, markDirectories: true }
	// 	},
	{
		pattern: '**/*/',
		cwd: 'fixtures',
		globOptions: { },
		fgOptions: { onlyDirectories: true, markDirectories: true }
	}
]);
