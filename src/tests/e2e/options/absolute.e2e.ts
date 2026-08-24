import * as path from 'node:path';
import * as process from 'node:process';
import * as runner from '../runner.js';

const CWD = process.cwd();
const CWD_POSIX = CWD.replaceAll('\\', '/');

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
