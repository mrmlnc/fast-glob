import * as smoke from './smoke';

smoke.suite('Smoke → CaseSensitiveMatch', [
	{
		pattern: 'fixtures/File.md'
	},
	{
		pattern: 'fixtures/File.md',
		globOptions: { nocase: true },
		fgOptions: { caseSensitiveMatch: false }
	}
]);
