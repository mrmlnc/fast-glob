import * as os from 'os';

import * as smoke from './smoke';

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
		condition: () => os.platform() !== 'win32'
	}
]);
