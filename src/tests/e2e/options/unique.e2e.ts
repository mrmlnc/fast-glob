import * as runner from '../runner.js';

runner.suite('Options Unique', {
	tests: [
		{
			pattern: ['./file.md', 'file.md', '*'],
			options: {
				cwd: 'fixtures',
				unique: false,
			},
		},
		{
			pattern: ['./file.md', 'file.md', '*'],
			options: {
				cwd: 'fixtures',
				unique: true,
			},
			// There's a race going on here. On some OS the values may float.
			resultTransform: (entry) => {
				return entry.replace('./', '');
			},
		},
	],
});
