import * as smoke from './smoke';

smoke.suite('Smoke → Ignore', [
	{
		pattern: 'fixtures/**/*',
		globOptions: { ignore: ['*.md'] },
		fgOptions: { ignore: ['*.md'] }
	},
	{
		pattern: 'fixtures/**/*',
		globOptions: { ignore: ['**/*.md'] },
		fgOptions: { ignore: ['**/*.md'] }
	}
]);

smoke.suite('Smoke → Ignore (inverted)', [
	{
		pattern: 'fixtures/**/*',
		globOptions: { ignore: ['!fixtures/*.md'] },
		fgOptions: { ignore: ['!fixtures/*.md'] }
	},
	{
		pattern: 'fixtures/**/*',
		globOptions: { ignore: ['!fixtures/**/*.md'] },
		fgOptions: { ignore: ['!fixtures/**/*.md'] }
	},
	{
		pattern: 'fixtures/**/*',
		globOptions: { ignore: ['!fixtures/**/nested/**/*'] },
		fgOptions: { ignore: ['!fixtures/**/nested/**/*'] }
	},
	{
		pattern: 'fixtures/**/*',
		globOptions: { ignore: ['!fixtures/**/nested/**/*', '**/*.md'] },
		fgOptions: { ignore: ['!fixtures/**/nested/**/*', '**/*.md'] }
	}
]);
