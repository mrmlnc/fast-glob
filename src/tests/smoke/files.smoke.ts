import * as smoke from './smoke';

smoke.suite('Smoke → Files', [
	{
		pattern: 'fixtures/*',
		globOptions: { nodir: true },
		fgOptions: { onlyFiles: true }
	},
	{
		pattern: 'fixtures/**',
		globOptions: { nodir: true },
		fgOptions: { onlyFiles: true }
	},
	{
		pattern: 'fixtures/**/*',
		globOptions: { nodir: true },
		fgOptions: { onlyFiles: true }
	}
]);

smoke.suite('Smoke → Files (cwd)', [
	{
		pattern: '*',
		cwd: 'fixtures',
		globOptions: { nodir: true },
		fgOptions: { onlyFiles: true }
	},
	{
		pattern: '**',
		cwd: 'fixtures',
		globOptions: { nodir: true },
		fgOptions: { onlyFiles: true }
	},
	{
		pattern: '**/*',
		cwd: 'fixtures',
		globOptions: { nodir: true },
		fgOptions: { onlyFiles: true }
	}
]);
