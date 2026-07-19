import * as runner from '../runner.js';

runner.suite('Options Ignore', {
	tests: [
		{
			pattern: 'fixtures/**/*',
			options: {
				ignore: ['**/*.md'],
			},
		},
		{
			pattern: 'fixtures/**/*',
			options: {
				ignore: ['!**/*.md'],
			},
		},
	],
});
