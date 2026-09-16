import * as path from 'node:path';
import * as process from 'node:process';
import { pathToFileURL } from 'node:url';
import { convertPathToPattern } from '../../../index.js';
import * as runner from '../runner.js';

const CWD = process.cwd();
const CWD_POSIX = CWD.replaceAll('\\', '/');
const FIXTURES_PATH = path.join(CWD, 'fixtures');
const FIXTURES_PATTERN = convertPathToPattern(FIXTURES_PATH);
const ROOTED_FIXTURES_PATTERN = `/${convertPathToPattern(FIXTURES_PATH.slice(path.parse(CWD).root.length))}`;

runner.suite('Options Absolute', {
	resultTransform: runner.absoluteResultTransform,
	tests: [
		{
			pattern: 'fixtures/*',
			options: {
				absolute: true,
			},
		},
		{
			pattern: 'fixtures/**',
			options: {
				absolute: true,
			},
			issue: 47,
		},
		{
			pattern: 'fixtures/**/*',
			options: {
				absolute: true,
			},
		},
		{
			pattern: 'fixtures/../*',
			options: {
				absolute: true,
			},
		},
	],
});

runner.suite('Options Absolute (ignore)', {
	resultTransform: runner.absoluteResultTransform,
	tests: [
		{
			pattern: 'fixtures/*/*',
			options: {
				ignore: ['fixtures/*/nested'],
				absolute: true,
			},
		},
		{
			pattern: 'fixtures/*/*',
			options: {
				ignore: ['**/nested'],
				absolute: true,
			},
		},

		{
			pattern: 'fixtures/*',
			options: {
				ignore: [path.posix.join(CWD_POSIX, 'fixtures', '*')],
				absolute: true,
			},
		},
		{
			pattern: 'fixtures/**',
			options: {
				ignore: [path.posix.join(CWD_POSIX, 'fixtures', '*')],
				absolute: true,
			},
			issue: 47,
		},
	],
});

runner.suite('Options Absolute (cwd)', {
	resultTransform: runner.absoluteResultTransform,
	tests: [
		{
			pattern: '*',
			options: {
				cwd: 'fixtures',
				absolute: true,
			},
		},
		{
			pattern: '**',
			options: {
				cwd: 'fixtures',
				absolute: true,
			},
		},
		{
			pattern: '**/*',
			options: {
				cwd: 'fixtures',
				absolute: true,
			},
		},
	],
});

runner.suite('Options Absolute (cwd & ignore)', {
	resultTransform: runner.absoluteResultTransform,
	tests: [
		{
			pattern: '*/*',
			options: {
				ignore: ['*/nested'],
				cwd: 'fixtures',
				absolute: true,
			},
		},
		{
			pattern: '*/*',
			options: {
				ignore: ['**/nested'],
				cwd: 'fixtures',
				absolute: true,
			},
		},
		{
			pattern: 'file.md',
			options: {
				ignore: [path.posix.join('**', 'fixtures', '**')],
				cwd: 'fixtures',
				absolute: true,
			},
		},

		{
			pattern: '*',
			options: {
				ignore: [path.posix.join(CWD_POSIX, 'fixtures', '*')],
				cwd: 'fixtures',
				absolute: true,
			},
		},
		{
			pattern: '**',
			options: {
				ignore: [path.posix.join(CWD_POSIX, 'fixtures', '*')],
				cwd: 'fixtures',
				absolute: true,
			},
		},
		{
			pattern: '**',
			options: {
				ignore: [path.posix.join(CWD_POSIX, 'fixtures', '**')],
				cwd: 'fixtures',
				absolute: true,
			},
		},
	],
});

runner.suite('Options Absolute (rooted negative patterns)', {
	resultTransform: runner.absoluteResultTransform,
	tests: [
		...['file.md', '*.md', '[f]ile.md', '{file,missing}.md', '@(file|missing).md', String.raw`file\.md`].map((pattern) => ({
			pattern: [`${ROOTED_FIXTURES_PATTERN}/file.md`, `!${ROOTED_FIXTURES_PATTERN}/${pattern}`],
			options: { absolute: true },
			issue: 486,
			expected: () => [],
		})),
		{
			pattern: [`${ROOTED_FIXTURES_PATTERN}/*.md`, `!${ROOTED_FIXTURES_PATTERN}/file.md`],
			options: { absolute: true },
			expected: () => [],
		},
		{
			pattern: [`${FIXTURES_PATTERN}/file.md`, `!${ROOTED_FIXTURES_PATTERN}/file.md`],
			options: { absolute: true },
			expected: () => [],
		},
		{
			pattern: [`${ROOTED_FIXTURES_PATTERN}/file.md`, `!${FIXTURES_PATTERN}/file.md`],
			options: { absolute: true },
			expected: () => [],
		},
		{
			pattern: ['fixtures/file.md', '!fixtures/file.md'],
			options: { absolute: true },
			expected: () => [],
		},
		...[false, true].map((absolute) => ({
			pattern: 'fixtures/*.md',
			options: { absolute, ignore: [`${ROOTED_FIXTURES_PATTERN}/file.md`] },
			expected: () => [],
		})),
		...['fixtures', FIXTURES_PATH, pathToFileURL(FIXTURES_PATH)].map((cwd) => ({
			pattern: 'file.md',
			options: { cwd, absolute: true, ignore: [`${ROOTED_FIXTURES_PATTERN}/file.md`] },
			expected: () => [],
		})),
		{
			pattern: [`${ROOTED_FIXTURES_PATTERN}/file.md`, `!${ROOTED_FIXTURES_PATTERN}/file.md`],
			options: { cwd: path.join(FIXTURES_PATH, 'first'), absolute: true },
			expected: () => [],
		},
		...['missing.md', 'missing/../file.md'].map((pattern) => ({
			pattern: [`${ROOTED_FIXTURES_PATTERN}/file.md`, `!${ROOTED_FIXTURES_PATTERN}/${pattern}`],
			options: { absolute: true },
			expected: () => ['<root>/fixtures/file.md'],
		})),
		...[false, true].map((caseSensitiveMatch) => ({
			pattern: 'fixtures/*.md',
			options: { absolute: true, caseSensitiveMatch, ignore: [`${ROOTED_FIXTURES_PATTERN}/FILE.md`] },
			expected: () => caseSensitiveMatch ? ['<root>/fixtures/file.md'] : [],
		})),
		{
			pattern: [`${ROOTED_FIXTURES_PATTERN}/.file`, `!${ROOTED_FIXTURES_PATTERN}/**`],
			options: { absolute: true },
			expected: () => [],
		},
		{
			pattern: [`${ROOTED_FIXTURES_PATTERN}/first/`, `!${ROOTED_FIXTURES_PATTERN}/first/`],
			options: { absolute: true, onlyDirectories: true },
			expected: () => [],
		},
		{
			pattern: ['fixtures/{first,second}/file.md', `!${ROOTED_FIXTURES_PATTERN}/first/**`],
			options: { absolute: true },
			expected: () => ['<root>/fixtures/second/file.md'],
		},
	],
});
