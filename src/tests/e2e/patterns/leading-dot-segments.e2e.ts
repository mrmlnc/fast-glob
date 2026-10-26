import * as runner from '../runner.js';

for (const prefix of ['././', './././']) {
	runner.suite(`Patterns with repeated leading dot segments (${prefix})`, {
		tests: [
			{
				pattern: `${prefix}fixtures/file.md`,
				expected: () => ['./fixtures/file.md'],
			},
			{
				pattern: `${prefix}fixtures/*.md`,
				expected: () => ['./fixtures/file.md'],
			},
			{
				pattern: `${prefix}fixtures/first/*/*.md`,
				expected: () => ['./fixtures/first/nested/file.md'],
			},
			{
				pattern: `${prefix}fixtures/first/**/*.json`,
				expected: () => ['./fixtures/first/nested/directory/file.json'],
			},
			{
				pattern: `${prefix}file.md`,
				options: { cwd: 'fixtures' },
				expected: () => ['./file.md'],
			},
			{
				pattern: `${prefix}../*.md`,
				options: { cwd: 'fixtures/first' },
				expected: () => ['./../file.md'],
			},
			{
				pattern: `${prefix}fixtures/*.md`,
				options: { ignore: [`${prefix}fixtures/file.md`] },
				expected: () => [],
			},
			{
				pattern: [`${prefix}fixtures/*.md`, `!${prefix}fixtures/file.md`],
				expected: () => [],
			},
		],
	});
}
