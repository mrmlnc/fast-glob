import * as smoke from './smoke';
import * as utils from '..';

smoke.suite('Smoke → CaseSensitiveMatch', [
	{
		pattern: 'fixtures/File.md'
	},
	{
		pattern: 'fixtures/File.md',
		globOptions: { nocase: true },
		fgOptions: { caseSensitiveMatch: false }
	},

	// ISSUE-276
	{
		pattern: '/tmp/*',
		globOptions: { nocase: true, nodir: false },
		fgOptions: { caseSensitiveMatch: false, onlyFiles: false },
		condition: () => !utils.platform.isWindows()
	}
]);
