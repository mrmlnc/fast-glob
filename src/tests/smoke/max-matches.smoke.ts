import * as smoke from './smoke';

smoke.suite('Smoke → maxMatches', [
	{
		pattern: 'fixtures/**/*',
		fgOptions: { maxMatches: 1 }
	}
]);
