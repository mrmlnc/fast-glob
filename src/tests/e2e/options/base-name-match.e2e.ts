import * as runner from '../runner.js';

runner.suite('Options MatchBase', {
	tests: [
		{
			pattern: 'file.md',
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
			},
		},
		{
			pattern: 'first/*/file.md',
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
			},
		},
		{
			pattern: 'first/**/file.md',
			options: {
				cwd: 'fixtures',
				baseNameMatch: true,
			},
		},
	],
});
