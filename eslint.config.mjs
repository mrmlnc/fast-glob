import { build } from 'eslint-config-mrmlnc';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	...build(),
	{
		rules: {
			'require-unicode-regexp': 'off',
			'unicorn/prefer-top-level-await': 'off',
		},
	},
]);
