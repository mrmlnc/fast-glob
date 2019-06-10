import * as smoke from './smoke';

smoke.suite('Smoke → MatchBase', [
	{
		broken: true,
		issue: 199,
		pattern: '*.md',
		cwd: 'fixtures',
		globOptions: { matchBase: true },
		fgOptions: { baseNameMatch: true }
	}
]);
