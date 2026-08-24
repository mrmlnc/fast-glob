import * as path from 'node:path';
import * as process from 'node:process';
import { pathToFileURL } from 'node:url';
import * as runner from '../runner.js';

const FIXTURES_URL = pathToFileURL(path.resolve(process.cwd(), 'fixtures'));

runner.suite('Options cwd (URL)', {
	tests: [
		{
			pattern: '*',
			options: {
				cwd: FIXTURES_URL,
			},
		},
		{
			pattern: '**',
			options: {
				cwd: FIXTURES_URL,
			},
		},
		{
			pattern: '**/*.md',
			options: {
				cwd: FIXTURES_URL,
			},
		},
		{
			pattern: '*',
			options: {
				cwd: FIXTURES_URL,
				onlyFiles: false,
			},
		},
	],
});

runner.suite('Options cwd (URL & absolute)', {
	resultTransform: runner.absoluteResultTransform,
	tests: [
		{
			pattern: '*',
			options: {
				cwd: FIXTURES_URL,
				absolute: true,
			},
		},
		{
			pattern: '**/*.md',
			options: {
				cwd: FIXTURES_URL,
				absolute: true,
			},
		},
	],
});
