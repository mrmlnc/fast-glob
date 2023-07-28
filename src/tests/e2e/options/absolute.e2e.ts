import * as path from 'node:path';

import * as runner from '../runner';

const CWD = process.cwd();
const CWD_POSIX = CWD.replaceAll('\\', '/');

function resultTransform(item: string): string {
	return item
		.replace(CWD, '<root>')
		// Backslashes are used on Windows.
		// The `fixtures` directory is under our control, so we are confident that the conversions are correct.
		.replaceAll(/[/\\]/g, '/');
}

runner.suite('Options Absolute', {
	resultTransform,
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
	resultTransform,
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
	resultTransform,
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
	resultTransform,
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
