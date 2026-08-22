import * as runner from '../runner.js';

runner.suite('Options MarkDirectories', {
	tests: [
		{
			pattern: 'fixtures/**/*',
			options: {
				markDirectories: true,
			},
		},
	],
});
