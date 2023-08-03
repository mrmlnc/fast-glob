import * as runner from '../runner';

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
