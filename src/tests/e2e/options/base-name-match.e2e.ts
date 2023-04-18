import * as runner from '../runner';

runner.suite('Options MatchBase', {
	tests: [
		{
			pattern: '*.md',
			options: {
				cwd: 'fixtures',
				baseNameMatch: true
			}
		}
	]
});
