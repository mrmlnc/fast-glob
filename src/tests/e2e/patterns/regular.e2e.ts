import * as runner from '../runner';

runner.suite('Patterns Regular', {
	tests: [
		{ pattern: 'fixtures/*' },
		{ pattern: 'fixtures/**', issue: 47 },
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
	]
});

runner.suite('Patterns Regular (cwd)', {
	tests: [
		{ pattern: '*', options: { cwd: 'fixtures' } },
		{ pattern: '**', options: { cwd: 'fixtures' } },
		{ pattern: '**/*', options: { cwd: 'fixtures' } },

		{ pattern: '*/nested', options: { cwd: 'fixtures' } },
		{ pattern: '*/nested/*', options: { cwd: 'fixtures' } },
		{ pattern: '*/nested/**', options: { cwd: 'fixtures' } },
		{ pattern: '*/nested/**/*', options: { cwd: 'fixtures' } },
		{ pattern: '**/nested/*', options: { cwd: 'fixtures' } },
		{ pattern: '**/nested/**', options: { cwd: 'fixtures' } },
		{ pattern: '**/nested/**/*', options: { cwd: 'fixtures' } },

		{ pattern: '{first,second}', options: { cwd: 'fixtures' } },
		{ pattern: '{first,second}/*', options: { cwd: 'fixtures' } },
		{ pattern: '{first,second}/**', options: { cwd: 'fixtures' } },
		{ pattern: '{first,second}/**/*', options: { cwd: 'fixtures' } },

		{ pattern: '*/{first,second}/*', options: { cwd: 'fixtures' } },
		{ pattern: '*/{first,second}/*/{nested,file.md}', options: { cwd: 'fixtures' } },
		{ pattern: '**/{first,second}/**', options: { cwd: 'fixtures' } },
		{ pattern: '**/{first,second}/{nested,file.md}', options: { cwd: 'fixtures' } },
		{ pattern: '**/{first,second}/**/{nested,file.md}', options: { cwd: 'fixtures' } },

		{ pattern: '{first,second}/{nested,file.md}', options: { cwd: 'fixtures' } },
		{ pattern: '{first,second}/*/nested/*', options: { cwd: 'fixtures' } },
		{ pattern: '{first,second}/**/nested/**', options: { cwd: 'fixtures' } },

		{ pattern: '*/{nested,file.md}/*', options: { cwd: 'fixtures' } },
		{ pattern: '**/{nested,file.md}/*', options: { cwd: 'fixtures' } }
	]
});

runner.suite('Patterns Regular (ignore)', {
	tests: [
		[
			{ pattern: 'fixtures/*', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/*', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/*', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/**', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/**', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/**', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/**/*', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/**/*', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/**/*', options: { ignore: ['**/*'] } }
		],

		[
			{ pattern: 'fixtures/*', options: { ignore: ['fixtures/*'] } },
			{ pattern: 'fixtures/*', options: { ignore: ['fixtures/**'] } },
			{ pattern: 'fixtures/*', options: { ignore: ['fixtures/**/*'] } },
			{ pattern: 'fixtures/**', options: { ignore: ['fixtures/*'] }, issue: 47 },
			{ pattern: 'fixtures/**', options: { ignore: ['fixtures/**'] } },
			{ pattern: 'fixtures/**', options: { ignore: ['fixtures/**/*'] }, issue: 47 },
			{ pattern: 'fixtures/**/*', options: { ignore: ['fixtures/*'] } },
			{ pattern: 'fixtures/**/*', options: { ignore: ['fixtures/**'] } },
			{ pattern: 'fixtures/**/*', options: { ignore: ['fixtures/**/*'] } }
		],

		[
			{ pattern: 'fixtures/*', options: { ignore: ['nested'] } },
			{ pattern: 'fixtures/**', options: { ignore: ['nested'] }, issue: 47 },
			{ pattern: 'fixtures/**/*', options: { ignore: ['nested'] } }
		],

		[
			{ pattern: 'fixtures/*', options: { ignore: ['*/nested'] } },
			{ pattern: 'fixtures/*', options: { ignore: ['**/nested'] } },
			{ pattern: 'fixtures/**', options: { ignore: ['*/nested'] }, issue: 47 },
			{ pattern: 'fixtures/**', options: { ignore: ['**/nested'] }, issue: 47 },
			{ pattern: 'fixtures/**/*', options: { ignore: ['*/nested'] } },
			{ pattern: 'fixtures/**/*', options: { ignore: ['**/nested'] } }
		],

		[
			{ pattern: 'fixtures/*', options: { ignore: ['*/nested/*'] } },
			{ pattern: 'fixtures/*', options: { ignore: ['**/nested/*'] } },
			{ pattern: 'fixtures/**', options: { ignore: ['*/nested/*'] }, issue: 47 },
			{ pattern: 'fixtures/**', options: { ignore: ['**/nested/*'] }, issue: 47 },
			{ pattern: 'fixtures/**/*', options: { ignore: ['*/nested/*'] } },
			{ pattern: 'fixtures/**/*', options: { ignore: ['**/nested/*'] } }
		],

		[
			{ pattern: 'fixtures/*', options: { ignore: ['*/nested/**'] } },
			{ pattern: 'fixtures/*', options: { ignore: ['**/nested/**'] } },
			{ pattern: 'fixtures/**', options: { ignore: ['*/nested/**'] }, issue: 47 },
			{ pattern: 'fixtures/**', options: { ignore: ['**/nested/**'] }, issue: 47 },
			{ pattern: 'fixtures/**/*', options: { ignore: ['*/nested/**'] } },
			{ pattern: 'fixtures/**/*', options: { ignore: ['**/nested/**'] } }
		],

		[
			{ pattern: 'fixtures/*', options: { ignore: ['*/nested/**/*'] } },
			{ pattern: 'fixtures/*', options: { ignore: ['**/nested/**/*'] } },
			{ pattern: 'fixtures/**', options: { ignore: ['*/nested/**/*'] }, issue: 47 },
			{ pattern: 'fixtures/**', options: { ignore: ['**/nested/**/*'] }, issue: 47 },
			{ pattern: 'fixtures/**/*', options: { ignore: ['*/nested/**/*'] } },
			{ pattern: 'fixtures/**/*', options: { ignore: ['**/nested/**/*'] } }
		],

		[
			{ pattern: 'fixtures/*/nested', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['nested'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['nested/*'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['nested/**'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['nested/**/*'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['*/nested/*'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['*/nested/**'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['*/nested/**/*'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['**/nested/*'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['**/nested/**'] } },
			{ pattern: 'fixtures/*/nested', options: { ignore: ['**/nested/**/*'] } }
		],

		[
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['nested'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['nested/*'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['nested/**'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['nested/**/*'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['*/nested/*'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['*/nested/**'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['*/nested/**/*'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['**/nested/*'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['**/nested/**'] } },
			{ pattern: 'fixtures/*/nested/*', options: { ignore: ['**/nested/**/*'] } }
		],

		[
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['nested'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['nested/*'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['nested/**'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['nested/**/*'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['*/nested/*'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['*/nested/**'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['*/nested/**/*'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['**/nested/*'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['**/nested/**'] } },
			{ pattern: 'fixtures/*/nested/**', options: { ignore: ['**/nested/**/*'] } }
		],

		[
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['nested'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['nested/*'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['nested/**'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['nested/**/*'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['*/nested/*'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['*/nested/**'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['*/nested/**/*'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['**/nested/*'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['**/nested/**'] } },
			{ pattern: 'fixtures/*/nested/**/*', options: { ignore: ['**/nested/**/*'] } }
		],

		[
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['nested'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['nested/*'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['nested/**'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['nested/**/*'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['*/nested/*'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['*/nested/**'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['*/nested/**/*'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['**/nested/*'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['**/nested/**'] } },
			{ pattern: 'fixtures/**/nested/*', options: { ignore: ['**/nested/**/*'] } }
		],

		[
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['nested'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['nested/*'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['nested/**'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['nested/**/*'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['*/nested/*'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['*/nested/**'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['*/nested/**/*'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['**/nested/*'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['**/nested/**'] } },
			{ pattern: 'fixtures/**/nested/**', options: { ignore: ['**/nested/**/*'] } }
		],

		[
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['nested'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['nested/*'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['nested/**'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['nested/**/*'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['*/nested/*'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['*/nested/**'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['*/nested/**/*'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['**/nested/*'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['**/nested/**'] } },
			{ pattern: 'fixtures/**/nested/**/*', options: { ignore: ['**/nested/**/*'] } }
		],

		[
			{ pattern: 'fixtures/!(ignore)*', options: { ignore: ['*'] } },
			{ pattern: 'fixtures/!(ignore)*', options: { ignore: ['**'] } },
			{ pattern: 'fixtures/!(ignore)*', options: { ignore: ['**/*'] } },
			{ pattern: 'fixtures/!(ignore)*', options: { ignore: ['fixtures/*'] } },
			{ pattern: 'fixtures/!(ignore)*', options: { ignore: ['fixtures/**'] } },
			{ pattern: 'fixtures/!(ignore)*', options: { ignore: ['fixtures/**/*'] } }
		]
	]
});

runner.suite('Patterns Regular (ignore & cwd)', {
	tests: [
		[
			{ pattern: '*', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '*', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '*', options: { ignore: ['**/*'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['**/*'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['**/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '*', options: { ignore: ['fixtures/*'], cwd: 'fixtures' } },
			{ pattern: '*', options: { ignore: ['fixtures/**'], cwd: 'fixtures' } },
			{ pattern: '*', options: { ignore: ['fixtures/**/*'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['fixtures/*'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['fixtures/**'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['fixtures/**/*'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['fixtures/*'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['fixtures/**'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['fixtures/**/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '*', options: { ignore: ['nested'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['nested'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['nested'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '*', options: { ignore: ['*/nested'], cwd: 'fixtures' } },
			{ pattern: '*', options: { ignore: ['**/nested'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['*/nested'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['**/nested'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['*/nested'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['**/nested'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '*', options: { ignore: ['*/nested/*'], cwd: 'fixtures' } },
			{ pattern: '*', options: { ignore: ['**/nested/*'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['*/nested/*'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['**/nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['*/nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['**/nested/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '*', options: { ignore: ['*/nested/**'], cwd: 'fixtures' } },
			{ pattern: '*', options: { ignore: ['**/nested/**'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['*/nested/**'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['**/nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['*/nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['**/nested/**'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '*', options: { ignore: ['*/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '*', options: { ignore: ['**/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['*/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '**', options: { ignore: ['**/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['*/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '**/*', options: { ignore: ['**/nested/**/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '*/nested', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['nested'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['*/nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['*/nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['*/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['**/nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['**/nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested', options: { ignore: ['**/nested/**/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '*/nested/*', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['nested'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['*/nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['*/nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['*/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['**/nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['**/nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/*', options: { ignore: ['**/nested/**/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '*/nested/**', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['nested'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['*/nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['*/nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['*/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['**/nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['**/nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**', options: { ignore: ['**/nested/**/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '*/nested/**/*', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['nested'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['*/nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['*/nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['*/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['**/nested/*'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['**/nested/**'], cwd: 'fixtures' } },
			{ pattern: '*/nested/**/*', options: { ignore: ['**/nested/**/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '**/nested/*', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['**/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['nested'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['*/nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['*/nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['*/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['**/nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['**/nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/*', options: { ignore: ['**/nested/**/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '**/nested/**', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['**/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['nested'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['*/nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['*/nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['*/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['**/nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['**/nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**', options: { ignore: ['**/nested/**/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '**/nested/**/*', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['**/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['nested'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['*/nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['*/nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['*/nested/**/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['**/nested/*'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['**/nested/**'], cwd: 'fixtures' } },
			{ pattern: '**/nested/**/*', options: { ignore: ['**/nested/**/*'], cwd: 'fixtures' } }
		],

		[
			{ pattern: '!(ignore)*', options: { ignore: ['*'], cwd: 'fixtures' } },
			{ pattern: '!(ignore)*', options: { ignore: ['**'], cwd: 'fixtures' } },
			{ pattern: '!(ignore)*', options: { ignore: ['**/*'], cwd: 'fixtures' } }
		]
	]
});

runner.suite('Patterns Regular (relative)', {
	tests: [
		[
			{ pattern: './*' },
			{ pattern: './*', options: { cwd: 'fixtures' } },
			{ pattern: './**', options: { cwd: 'fixtures' } },
			{ pattern: './**/*', options: { cwd: 'fixtures' } }
		],

		[
			{ pattern: '../*', options: { cwd: 'fixtures/first' } },
			{ pattern: '../**', options: { cwd: 'fixtures/first' }, issue: 47 },
			{ pattern: '../../*', options: { cwd: 'fixtures/first/nested' } }
		],

		[
			{ pattern: '../{first,second}', options: { cwd: 'fixtures/first' } },
			{ pattern: './../*', options: { cwd: 'fixtures/first' } }
		]
	]
});

runner.suite('Patterns Regular (relative & ignore)', {
	tests: [
		{ pattern: './../*', options: { cwd: 'fixtures/first', ignore: ['../*'] } },
		{ pattern: './../*', options: { cwd: 'fixtures/first', ignore: ['./../*'] } },
		{ pattern: './../*', options: { cwd: 'fixtures/first', ignore: ['**'] } },

		{ pattern: '../*', options: { cwd: 'fixtures/first', ignore: ['../*'] } },
		{ pattern: '../*', options: { cwd: 'fixtures/first', ignore: ['**'] } },

		{ pattern: '../../*', options: { cwd: 'fixtures/first/nested', ignore: ['../../*'] } },
		{ pattern: '../../*', options: { cwd: 'fixtures/first/nested', ignore: ['**'] } },

		{ pattern: '../{first,second}', options: { cwd: 'fixtures/first', ignore: ['../first/**'] } },
		{ pattern: '../{first,second}', options: { cwd: 'fixtures/first', ignore: ['**/first/**'] } }
	]
});

runner.suite('Patterns Regular (negative group)', {
	tests: [
		{ pattern: '**/!(*.md)', options: { cwd: 'fixtures/first' } }
	]
});

runner.suite('Patterns Regular (segmented lists)', {
	tests: [
		{ pattern: '{book.xml,**/library/*/book.md}', options: { cwd: 'fixtures/third' } },
		{ pattern: '{book.xml,library/**/a/book.md}', options: { cwd: 'fixtures/third' } }
	]
});
