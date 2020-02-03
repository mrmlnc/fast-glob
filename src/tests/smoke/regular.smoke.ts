import * as smoke from './smoke';

smoke.suite('Smoke → Regular', [
	{ pattern: 'fixtures/*' },
	{ pattern: 'fixtures/**', broken: true, issue: 47 },
	{ pattern: 'fixtures/**/*' },

	{ pattern: 'fixtures/*/nested' },
	{ pattern: 'fixtures/*/nested/*' },
	{ pattern: 'fixtures/*/nested/**' },
	{ pattern: 'fixtures/*/nested/**/*' },
	{ pattern: 'fixtures/**/nested/*' },
	{ pattern: 'fixtures/**/nested/**' },
	{ pattern: 'fixtures/**/nested/**/*' },

	{ pattern: 'fixtures/{first,second}' },
	{ pattern: 'fixtures/{first,second}/*' },
	{ pattern: 'fixtures/{first,second}/**' },
	{ pattern: 'fixtures/{first,second}/**/*' },

	{ pattern: '@(fixtures)/{first,second}' },
	{ pattern: '@(fixtures)/{first,second}/*' },

	{ pattern: 'fixtures/*/{first,second}/*' },
	{ pattern: 'fixtures/*/{first,second}/*/{nested,file.md}' },
	{ pattern: 'fixtures/**/{first,second}/**' },
	{ pattern: 'fixtures/**/{first,second}/{nested,file.md}' },
	{ pattern: 'fixtures/**/{first,second}/**/{nested,file.md}' },

	{ pattern: 'fixtures/{first,second}/{nested,file.md}' },
	{ pattern: 'fixtures/{first,second}/*/nested/*' },
	{ pattern: 'fixtures/{first,second}/**/nested/**' },

	{ pattern: 'fixtures/*/{nested,file.md}/*' },
	{ pattern: 'fixtures/**/{nested,file.md}/*' },

	{ pattern: './fixtures/*' }
]);

smoke.suite('Smoke → Regular (cwd)', [
	{ pattern: '*', cwd: 'fixtures' },
	{ pattern: '**', cwd: 'fixtures' },
	{ pattern: '**/*', cwd: 'fixtures' },

	{ pattern: '*/nested', cwd: 'fixtures' },
	{ pattern: '*/nested/*', cwd: 'fixtures' },
	{ pattern: '*/nested/**', cwd: 'fixtures' },
	{ pattern: '*/nested/**/*', cwd: 'fixtures' },
	{ pattern: '**/nested/*', cwd: 'fixtures' },
	{ pattern: '**/nested/**', cwd: 'fixtures' },
	{ pattern: '**/nested/**/*', cwd: 'fixtures' },

	{ pattern: '{first,second}', cwd: 'fixtures' },
	{ pattern: '{first,second}/*', cwd: 'fixtures' },
	{ pattern: '{first,second}/**', cwd: 'fixtures' },
	{ pattern: '{first,second}/**/*', cwd: 'fixtures' },

	{ pattern: '*/{first,second}/*', cwd: 'fixtures' },
	{ pattern: '*/{first,second}/*/{nested,file.md}', cwd: 'fixtures' },
	{ pattern: '**/{first,second}/**', cwd: 'fixtures' },
	{ pattern: '**/{first,second}/{nested,file.md}', cwd: 'fixtures' },
	{ pattern: '**/{first,second}/**/{nested,file.md}', cwd: 'fixtures' },

	{ pattern: '{first,second}/{nested,file.md}', cwd: 'fixtures' },
	{ pattern: '{first,second}/*/nested/*', cwd: 'fixtures' },
	{ pattern: '{first,second}/**/nested/**', cwd: 'fixtures' },

	{ pattern: '*/{nested,file.md}/*', cwd: 'fixtures' },
	{ pattern: '**/{nested,file.md}/*', cwd: 'fixtures' },

	{
		pattern: './*',
		cwd: 'fixtures',
		correct: true,
		reason: 'The `node-glob package returns entries with leading `./`'
	}
]);

smoke.suite('Smoke → Regular (ignore)', [
	[
		{ pattern: 'fixtures/*', ignore: '*' },
		{ pattern: 'fixtures/*', ignore: '**' },
		{ pattern: 'fixtures/*', ignore: '**/*' },
		{ pattern: 'fixtures/**', ignore: '*' },
		{ pattern: 'fixtures/**', ignore: '**' },
		{ pattern: 'fixtures/**', ignore: '**/*' },
		{ pattern: 'fixtures/**/*', ignore: '*' },
		{ pattern: 'fixtures/**/*', ignore: '**' },
		{ pattern: 'fixtures/**/*', ignore: '**/*' }
	],

	[
		{ pattern: 'fixtures/*', ignore: 'fixtures/*' },
		{ pattern: 'fixtures/*', ignore: 'fixtures/**' },
		{ pattern: 'fixtures/*', ignore: 'fixtures/**/*' },
		{ pattern: 'fixtures/**', ignore: 'fixtures/*', broken: true, issue: 47 },
		{ pattern: 'fixtures/**', ignore: 'fixtures/**' },
		{ pattern: 'fixtures/**', ignore: 'fixtures/**/*', broken: true, issue: 47 },
		{ pattern: 'fixtures/**/*', ignore: 'fixtures/*' },
		{ pattern: 'fixtures/**/*', ignore: 'fixtures/**' },
		{ pattern: 'fixtures/**/*', ignore: 'fixtures/**/*' }
	],

	[
		{ pattern: 'fixtures/*', ignore: 'nested' },
		{ pattern: 'fixtures/**', ignore: 'nested', broken: true, issue: 47 },
		{ pattern: 'fixtures/**/*', ignore: 'nested' }
	],

	[
		{ pattern: 'fixtures/*', ignore: '*/nested' },
		{ pattern: 'fixtures/*', ignore: '**/nested' },
		{ pattern: 'fixtures/**', ignore: '*/nested', broken: true, issue: 47 },
		{
			pattern: 'fixtures/**',
			ignore: '**/nested',
			broken: true,
			issue: 47,
			correct: true,
			reason: 'The negative pattern excludes any entries (files and directories) at any nesting level.'
		},
		{ pattern: 'fixtures/**/*', ignore: '*/nested' },
		{
			pattern: 'fixtures/**/*',
			ignore: '**/nested',
			correct: true,
			reason: 'The negative pattern excludes any entries (files and directories) at any nesting level.'
		}
	],

	[
		{ pattern: 'fixtures/*', ignore: '*/nested/*' },
		{ pattern: 'fixtures/*', ignore: '**/nested/*' },
		{ pattern: 'fixtures/**', ignore: '*/nested/*', broken: true, issue: 47 },
		{ pattern: 'fixtures/**', ignore: '**/nested/*', broken: true, issue: 47 },
		{ pattern: 'fixtures/**/*', ignore: '*/nested/*' },
		{ pattern: 'fixtures/**/*', ignore: '**/nested/*' }
	],

	[
		{ pattern: 'fixtures/*', ignore: '*/nested/**' },
		{ pattern: 'fixtures/*', ignore: '**/nested/**' },
		{ pattern: 'fixtures/**', ignore: '*/nested/**', broken: true, issue: 47 },
		{ pattern: 'fixtures/**', ignore: '**/nested/**', broken: true, issue: 47 },
		{ pattern: 'fixtures/**/*', ignore: '*/nested/**' },
		{ pattern: 'fixtures/**/*', ignore: '**/nested/**' }
	],

	[
		{ pattern: 'fixtures/*', ignore: '*/nested/**/*' },
		{ pattern: 'fixtures/*', ignore: '**/nested/**/*' },
		{ pattern: 'fixtures/**', ignore: '*/nested/**/*', broken: true, issue: 47 },
		{ pattern: 'fixtures/**', ignore: '**/nested/**/*', broken: true, issue: 47 },
		{ pattern: 'fixtures/**/*', ignore: '*/nested/**/*' },
		{ pattern: 'fixtures/**/*', ignore: '**/nested/**/*' }
	],

	[
		{ pattern: 'fixtures/*/nested', ignore: '*' },
		{ pattern: 'fixtures/*/nested', ignore: '**' },
		{ pattern: 'fixtures/*/nested', ignore: '**/*' },
		{ pattern: 'fixtures/*/nested', ignore: 'nested' },
		{ pattern: 'fixtures/*/nested', ignore: 'nested/*' },
		{ pattern: 'fixtures/*/nested', ignore: 'nested/**' },
		{ pattern: 'fixtures/*/nested', ignore: 'nested/**/*' },
		{ pattern: 'fixtures/*/nested', ignore: '*/nested/*' },
		{ pattern: 'fixtures/*/nested', ignore: '*/nested/**' },
		{ pattern: 'fixtures/*/nested', ignore: '*/nested/**/*' },
		{ pattern: 'fixtures/*/nested', ignore: '**/nested/*' },
		{ pattern: 'fixtures/*/nested', ignore: '**/nested/**' },
		{ pattern: 'fixtures/*/nested', ignore: '**/nested/**/*' }
	],

	[
		{ pattern: 'fixtures/*/nested/*', ignore: '*' },
		{ pattern: 'fixtures/*/nested/*', ignore: '**' },
		{ pattern: 'fixtures/*/nested/*', ignore: '**/*' },
		{ pattern: 'fixtures/*/nested/*', ignore: 'nested' },
		{ pattern: 'fixtures/*/nested/*', ignore: 'nested/*' },
		{ pattern: 'fixtures/*/nested/*', ignore: 'nested/**' },
		{ pattern: 'fixtures/*/nested/*', ignore: 'nested/**/*' },
		{ pattern: 'fixtures/*/nested/*', ignore: '*/nested/*' },
		{ pattern: 'fixtures/*/nested/*', ignore: '*/nested/**' },
		{ pattern: 'fixtures/*/nested/*', ignore: '*/nested/**/*' },
		{ pattern: 'fixtures/*/nested/*', ignore: '**/nested/*' },
		{ pattern: 'fixtures/*/nested/*', ignore: '**/nested/**' },
		{ pattern: 'fixtures/*/nested/*', ignore: '**/nested/**/*' }
	],

	[
		{ pattern: 'fixtures/*/nested/**', ignore: '*' },
		{ pattern: 'fixtures/*/nested/**', ignore: '**' },
		{ pattern: 'fixtures/*/nested/**', ignore: '**/*' },
		{ pattern: 'fixtures/*/nested/**', ignore: 'nested' },
		{ pattern: 'fixtures/*/nested/**', ignore: 'nested/*' },
		{ pattern: 'fixtures/*/nested/**', ignore: 'nested/**' },
		{ pattern: 'fixtures/*/nested/**', ignore: 'nested/**/*' },
		{ pattern: 'fixtures/*/nested/**', ignore: '*/nested/*' },
		{ pattern: 'fixtures/*/nested/**', ignore: '*/nested/**' },
		{ pattern: 'fixtures/*/nested/**', ignore: '*/nested/**/*' },
		{ pattern: 'fixtures/*/nested/**', ignore: '**/nested/*' },
		{ pattern: 'fixtures/*/nested/**', ignore: '**/nested/**' },
		{ pattern: 'fixtures/*/nested/**', ignore: '**/nested/**/*' }
	],

	[
		{ pattern: 'fixtures/*/nested/**/*', ignore: '*' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: '**' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: '**/*' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: 'nested' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: 'nested/*' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: 'nested/**' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: 'nested/**/*' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: '*/nested/*' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: '*/nested/**' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: '*/nested/**/*' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: '**/nested/*' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: '**/nested/**' },
		{ pattern: 'fixtures/*/nested/**/*', ignore: '**/nested/**/*' }
	],

	[
		{ pattern: 'fixtures/**/nested/*', ignore: '*' },
		{ pattern: 'fixtures/**/nested/*', ignore: '**' },
		{ pattern: 'fixtures/**/nested/*', ignore: '**/*' },
		{ pattern: 'fixtures/**/nested/*', ignore: 'nested' },
		{ pattern: 'fixtures/**/nested/*', ignore: 'nested/*' },
		{ pattern: 'fixtures/**/nested/*', ignore: 'nested/**' },
		{ pattern: 'fixtures/**/nested/*', ignore: 'nested/**/*' },
		{ pattern: 'fixtures/**/nested/*', ignore: '*/nested/*' },
		{ pattern: 'fixtures/**/nested/*', ignore: '*/nested/**' },
		{ pattern: 'fixtures/**/nested/*', ignore: '*/nested/**/*' },
		{ pattern: 'fixtures/**/nested/*', ignore: '**/nested/*' },
		{ pattern: 'fixtures/**/nested/*', ignore: '**/nested/**' },
		{ pattern: 'fixtures/**/nested/*', ignore: '**/nested/**/*' }
	],

	[
		{ pattern: 'fixtures/**/nested/**', ignore: '*' },
		{ pattern: 'fixtures/**/nested/**', ignore: '**' },
		{ pattern: 'fixtures/**/nested/**', ignore: '**/*' },
		{ pattern: 'fixtures/**/nested/**', ignore: 'nested' },
		{ pattern: 'fixtures/**/nested/**', ignore: 'nested/*' },
		{ pattern: 'fixtures/**/nested/**', ignore: 'nested/**' },
		{ pattern: 'fixtures/**/nested/**', ignore: 'nested/**/*' },
		{ pattern: 'fixtures/**/nested/**', ignore: '*/nested/*' },
		{ pattern: 'fixtures/**/nested/**', ignore: '*/nested/**' },
		{ pattern: 'fixtures/**/nested/**', ignore: '*/nested/**/*' },
		{ pattern: 'fixtures/**/nested/**', ignore: '**/nested/*' },
		{ pattern: 'fixtures/**/nested/**', ignore: '**/nested/**' },
		{ pattern: 'fixtures/**/nested/**', ignore: '**/nested/**/*' }
	],

	[
		{ pattern: 'fixtures/**/nested/**/*', ignore: '*' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: '**' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: '**/*' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: 'nested' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: 'nested/*' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: 'nested/**' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: 'nested/**/*' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: '*/nested/*' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: '*/nested/**' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: '*/nested/**/*' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: '**/nested/*' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: '**/nested/**' },
		{ pattern: 'fixtures/**/nested/**/*', ignore: '**/nested/**/*' }
	]
]);

smoke.suite('Smoke → Regular (ignore & cwd)', [
	[
		{ pattern: '*', ignore: '*', cwd: 'fixtures' },
		{ pattern: '*', ignore: '**', cwd: 'fixtures' },
		{ pattern: '*', ignore: '**/*', cwd: 'fixtures' },
		{ pattern: '**', ignore: '*', cwd: 'fixtures' },
		{ pattern: '**', ignore: '**', cwd: 'fixtures' },
		{ pattern: '**', ignore: '**/*', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: '*', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: '**', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: '**/*', cwd: 'fixtures' }
	],

	[
		{ pattern: '*', ignore: 'fixtures/*', cwd: 'fixtures' },
		{ pattern: '*', ignore: 'fixtures/**', cwd: 'fixtures' },
		{ pattern: '*', ignore: 'fixtures/**/*', cwd: 'fixtures' },
		{ pattern: '**', ignore: 'fixtures/*', cwd: 'fixtures' },
		{ pattern: '**', ignore: 'fixtures/**', cwd: 'fixtures' },
		{ pattern: '**', ignore: 'fixtures/**/*', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: 'fixtures/*', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: 'fixtures/**', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: 'fixtures/**/*', cwd: 'fixtures' }
	],

	[
		{ pattern: '*', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '*', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '**', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '**', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: 'nested', cwd: 'fixtures' }
	],

	[
		{ pattern: '*', ignore: '*/nested', cwd: 'fixtures' },
		{ pattern: '*', ignore: '**/nested', cwd: 'fixtures' },
		{
			pattern: '**',
			ignore: '*/nested',
			cwd: 'fixtures',
			correct: true,
			reason: 'The negative pattern excludes any entries (files and directories) at any nesting level.'
		},
		{
			pattern: '**',
			ignore: '**/nested',
			cwd: 'fixtures',
			correct: true,
			reason: 'The negative pattern excludes any entries (files and directories) at any nesting level.'
		},
		{
			pattern: '**/*',
			ignore: '*/nested',
			cwd: 'fixtures',
			correct: true,
			reason: 'The negative pattern excludes any entries (files and directories) at any nesting level.'
		},
		{
			pattern: '**/*',
			ignore: '**/nested',
			cwd: 'fixtures',
			correct: true,
			reason: 'The negative pattern excludes any entries (files and directories) at any nesting level.'
		}
	],

	[
		{ pattern: '*', ignore: '*/nested/*', cwd: 'fixtures' },
		{ pattern: '*', ignore: '**/nested/*', cwd: 'fixtures' },
		{ pattern: '**', ignore: '*/nested/*', cwd: 'fixtures' },
		{ pattern: '**', ignore: '**/nested/*', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: '*/nested/*', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: '**/nested/*', cwd: 'fixtures' }
	],

	[
		{ pattern: '*', ignore: '*/nested/**', cwd: 'fixtures' },
		{ pattern: '*', ignore: '**/nested/**', cwd: 'fixtures' },
		{ pattern: '**', ignore: '*/nested/**', cwd: 'fixtures' },
		{ pattern: '**', ignore: '**/nested/**', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: '*/nested/**', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: '**/nested/**', cwd: 'fixtures' }
	],

	[
		{ pattern: '*', ignore: '*/nested/**/*', cwd: 'fixtures' },
		{ pattern: '*', ignore: '**/nested/**/*', cwd: 'fixtures' },
		{ pattern: '**', ignore: '*/nested/**/*', cwd: 'fixtures' },
		{ pattern: '**', ignore: '**/nested/**/*', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: '*/nested/**/*', cwd: 'fixtures' },
		{ pattern: '**/*', ignore: '**/nested/**/*', cwd: 'fixtures' }
	],

	[
		{ pattern: '*/nested', ignore: '*', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: '**', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: '**/*', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: 'nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: 'nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: 'nested/**/*', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: '*/nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: '*/nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: '*/nested/**/*', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: '**/nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: '**/nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested', ignore: '**/nested/**/*', cwd: 'fixtures' }
	],

	[
		{ pattern: '*/nested/*', ignore: '*', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: '**', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: '**/*', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: 'nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: 'nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: 'nested/**/*', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: '*/nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: '*/nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: '*/nested/**/*', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: '**/nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: '**/nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested/*', ignore: '**/nested/**/*', cwd: 'fixtures' }
	],

	[
		{ pattern: '*/nested/**', ignore: '*', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: '**', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: '**/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: 'nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: 'nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: 'nested/**/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: '*/nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: '*/nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: '*/nested/**/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: '**/nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: '**/nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested/**', ignore: '**/nested/**/*', cwd: 'fixtures' }
	],

	[
		{ pattern: '*/nested/**/*', ignore: '*', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: '**', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: '**/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: 'nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: 'nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: 'nested/**/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: '*/nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: '*/nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: '*/nested/**/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: '**/nested/*', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: '**/nested/**', cwd: 'fixtures' },
		{ pattern: '*/nested/**/*', ignore: '**/nested/**/*', cwd: 'fixtures' }
	],

	[
		{ pattern: '**/nested/*', ignore: '*', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: '**', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: '**/*', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: 'nested/*', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: 'nested/**', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: 'nested/**/*', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: '*/nested/*', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: '*/nested/**', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: '*/nested/**/*', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: '**/nested/*', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: '**/nested/**', cwd: 'fixtures' },
		{ pattern: '**/nested/*', ignore: '**/nested/**/*', cwd: 'fixtures' }
	],

	[
		{ pattern: '**/nested/**', ignore: '*', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: '**', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: '**/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: 'nested/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: 'nested/**', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: 'nested/**/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: '*/nested/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: '*/nested/**', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: '*/nested/**/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: '**/nested/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: '**/nested/**', cwd: 'fixtures' },
		{ pattern: '**/nested/**', ignore: '**/nested/**/*', cwd: 'fixtures' }
	],

	[
		{ pattern: '**/nested/**/*', ignore: '*', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: '**', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: '**/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: 'nested', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: 'nested/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: 'nested/**', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: 'nested/**/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: '*/nested/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: '*/nested/**', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: '*/nested/**/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: '**/nested/*', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: '**/nested/**', cwd: 'fixtures' },
		{ pattern: '**/nested/**/*', ignore: '**/nested/**/*', cwd: 'fixtures' }
	]
]);

smoke.suite('Smoke → Regular (relative)', [
	{ pattern: '../*', cwd: 'fixtures/first' },
	{ pattern: '../**', cwd: 'fixtures/first', broken: true, issue: 47 },
	{ pattern: '../../*', cwd: 'fixtures/first/nested' },

	{ pattern: '../{first,second}', cwd: 'fixtures/first' },
	{ pattern: './../*', cwd: 'fixtures/first' }
]);
