import * as smoke from './smoke';

smoke.suite('Smoke → Errors', [
	{
		pattern: 'non-exist-directory/**'
	},
	{
		pattern: 'non-exist-file.txt'
	}
]);

smoke.suite('Smoke → Errors (cwd)', [
	{
		pattern: '**',
		cwd: 'non-exist-directory'
	}
]);
