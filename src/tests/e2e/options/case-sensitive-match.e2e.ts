import * as runner from '../runner.js';
import * as utils from '../../index.js';

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
