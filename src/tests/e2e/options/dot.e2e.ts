import * as runner from '../runner';

runner.suite('Options Dot', {
	tests: [
		{
			pattern: 'fixtures/*',
			options: {
				dot: true,
			},
		},
		{
			pattern: 'fixtures/**',
			options: {
				dot: true,
			},
			issue: 47,
		},
		{
			pattern: 'fixtures/**/*',
			options: {
				dot: true,
			},
		},

		{
			pattern: 'fixtures/{.,}*',
		},
		{
			pattern: 'fixtures/{.*,*}',
		},
		{
			pattern: 'fixtures/**/{.,}*',
		},
		{
			pattern: 'fixtures/{.**,**}',
			issue: 47,
		},
		{
			pattern: 'fixtures/{**/.*,**}',
			issue: 47,
		},
	],
});
