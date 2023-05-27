import * as runner from '../runner';

runner.suite('Options Unique', {
	tests: [
		{
			pattern: ['./file.md', 'file.md', '*'],
			options: {
				cwd: 'fixtures',
				unique: false
			}
		},
		{
			pattern: ['./file.md', 'file.md', '*'],
			options: {
				cwd: 'fixtures',
				unique: true
			}
		}
	]
});
