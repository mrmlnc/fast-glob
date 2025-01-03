import * as fs from 'node:fs';

import dbg from 'dts-bundle-generator';

const [declarations] = dbg.generateDtsBundle([
	{
		filePath: './src/index.ts',
		libraries: {
			inlinedLibraries: [
				'@nodelib/fs.stat',
				'@nodelib/fs.scandir',
				'@nodelib/fs.walk',
			],
		},
		output: {
			exportReferencedTypes: false,
		},
	},
]);

const imports = declarations.match(/from\s'(?<filepath>[^']+)'/g);

const hasOnlyNodeDependencies = imports.every((it) => it.startsWith("from 'node:"));

if (!hasOnlyNodeDependencies) {
	throw new Error('Not only node: dependencies are found in the dts bundle.');
}

fs.mkdirSync('./build', { recursive: true });
fs.writeFileSync('./build/index.d.ts', declarations, 'utf8');
