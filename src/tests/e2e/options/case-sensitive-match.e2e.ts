import * as runner from '../runner';
import * as utils from '../..';

runner.suite('Options CaseSensitiveMatch', {
	tests: [
		{
			pattern: 'fixtures/File.md',
			expected: () => utils.platform.isUnix() ? [] : ['fixtures/File.md'],
		},
		{
			pattern: 'fixtures/File.md',
			options: { caseSensitiveMatch: false },
		},
	],
});
