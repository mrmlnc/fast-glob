import * as runner from '../runner';

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
