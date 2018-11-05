/**
 * @fileoverview
 * The `glob` package has no `deep` option.
 * So emulate it with negative patterns.
 */

import * as smoke from './smoke';

smoke.suite('Smoke → Deep', [
	{
		pattern: 'fixtures/**',
		globOptions: { ignore: ['!fixtures/*'] },
		fgOptions: { deep: 0 }
	},
	{
		pattern: 'fixtures/**',
		globOptions: { ignore: ['!fixtures/{*/,}*'] },
		fgOptions: { deep: 1 }
	}
]);

smoke.suite('Smoke → Deep (cwd)', [
	{
		pattern: '**',
		cwd: 'fixtures',
		globOptions: { ignore: ['!*'] },
		fgOptions: { deep: 0 }
	},
	{
		pattern: '**',
		cwd: 'fixtures',
		globOptions: { ignore: ['!{*/,}*'] },
		fgOptions: { deep: 1 }
	}
]);
