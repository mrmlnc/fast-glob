import cfg from 'eslint-config-mrmlnc';

/** @type {import('eslint').Linter.Config[]} */
const overrides = [
	...cfg.build({}),
];

export default overrides;
