import * as smoke from './smoke';

smoke.suite('Smoke → MarkDirectories', [
	{
		pattern: 'fixtures/**/*',
		fgOptions: { maxMatches: 1 }
	}
]);
