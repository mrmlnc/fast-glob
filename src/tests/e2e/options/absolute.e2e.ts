import * as path from 'path';

import * as runner from '../runner';

const CWD = process.cwd().replace(/\\/g, '/');

function resultTransform(item: string): string {
	return item.replace(CWD, '<root>');
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
				ignore: [path.posix.join(CWD, 'fixtures', '*')],
				absolute: true,
			},
		},
		{
			pattern: 'fixtures/**',
			options: {
				ignore: [path.posix.join(CWD, 'fixtures', '*')],
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
				ignore: [path.posix.join(CWD, 'fixtures', '*')],
				cwd: 'fixtures',
				absolute: true,
			},
		},
		{
			pattern: '**',
			options: {
				ignore: [path.posix.join(CWD, 'fixtures', '*')],
				cwd: 'fixtures',
				absolute: true,
			},
		},
		{
			pattern: '**',
			options: {
				ignore: [path.posix.join(CWD, 'fixtures', '**')],
				cwd: 'fixtures',
				absolute: true,
			},
		},
	],
});
