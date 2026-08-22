
import * as runner from '../runner.js';

runner.suite('Options Deep', {
	tests: [
		{
			pattern: 'fixtures/**',
			options: {
				deep: 0,
			},
		},
		{
			pattern: 'fixtures/**',
			options: {
				deep: 2,
			},
		},
	],
});

runner.suite('Options Deep (cwd)', {
	tests: [
		{
			pattern: '**',
			options: {
				cwd: 'fixtures',
				deep: 0,
			},
		},
		{
			pattern: '**',
			options: {
				cwd: 'fixtures',
				deep: 2,
			},
		},
	],
});
