import * as smoke from './smoke';

smoke.suite('Smoke → MatchBase', [
	{
		pattern: '*.md',
		cwd: 'fixtures',
		globOptions: { matchBase: true },
		fgOptions: { baseNameMatch: true }
	}
]);
