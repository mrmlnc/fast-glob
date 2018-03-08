import * as smoke from './smoke';

smoke.suite('Smoke → Dot', [
	{
		pattern: 'fixtures/*',
		globOptions: { dot: true },
		fgOptions: { dot: true }
	},
	{
		pattern: 'fixtures/**',
		globOptions: { dot: true },
		fgOptions: { dot: true },
		broken: true,
		issue: 47
	},
	{
		pattern: 'fixtures/**/*',
		globOptions: { dot: true },
		fgOptions: { dot: true }
	}
]);
