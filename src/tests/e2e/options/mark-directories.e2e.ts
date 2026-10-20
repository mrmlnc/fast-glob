import * as runner from '../runner.js';

runner.suite('Options MarkDirectories', {
	tests: [
		{
			pattern: 'fixtures/**/*',
			options: {
				markDirectories: true,
			},
		},
		{
			pattern: 'fixtures/first/',
			options: {
				onlyFiles: false,
				markDirectories: true,
			},
			expected: () => ['fixtures/first/'],
		},
		{
			pattern: 'fixtures/first/',
			options: {
				absolute: true,
				onlyFiles: false,
				markDirectories: true,
			},
			resultTransform: runner.absoluteResultTransform,
			expected: () => ['<root>/fixtures/first/'],
		},
		{
			pattern: 'fixtures/fi*/',
			options: {
				onlyFiles: false,
				markDirectories: true,
			},
			expected: () => ['fixtures/first/'],
		},
	],
});
