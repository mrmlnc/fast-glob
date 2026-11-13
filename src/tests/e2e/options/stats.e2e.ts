import * as runner from '../runner.js';
import type { Entry } from '../../../types/index.js';

/**
 * With `stats: true` the entries are objects, but the runner compares
 * plain paths, so only the path is kept for the assertion.
 */
function entryPath(entry: Entry): string {
	return entry.path;
}

runner.suite('Options Stats', {
	tests: [
		{
			pattern: 'fixtures/**/*.md',
			options: {
				stats: true,
			},
			issue: 547,
			resultTransform: entryPath as unknown as (entry: string) => string,
			expected: () => [
				'fixtures/file.md',
				'fixtures/first/file.md',
				'fixtures/first/nested/file.md',
				'fixtures/first/nested/directory/file.md',
				'fixtures/second/file.md',
				'fixtures/second/nested/file.md',
				'fixtures/second/nested/directory/file.md',
				'fixtures/third/library/a/book.md',
				'fixtures/third/library/b/book.md',
			],
		},
		{
			pattern: 'fixtures/first/**/*',
			options: {
				stats: true,
				onlyFiles: false,
			},
			issue: 547,
			resultTransform: entryPath as unknown as (entry: string) => string,
			expected: () => [
				'fixtures/first/file.md',
				'fixtures/first/nested',
				'fixtures/first/nested/directory',
				'fixtures/first/nested/directory/file.json',
				'fixtures/first/nested/directory/file.md',
				'fixtures/first/nested/file.md',
			],
		},
	],
});
