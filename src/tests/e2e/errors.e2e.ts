import * as runner from './runner.js';

runner.suite('Errors', {
	tests: [
		{
			pattern: 'non-exist-directory/**',
		},
		{
			pattern: 'non-exist-file.txt',
		},
	],
});

runner.suite('Errors (cwd)', {
	tests: [
		{
			pattern: '**',
			options: {
				cwd: 'non-exist-directory',
			},
		},
	],
});
