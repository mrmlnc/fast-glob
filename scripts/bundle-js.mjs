import esbuild from 'esbuild';

import package_ from '../package.json' with { type: 'json' };

await esbuild.build({
	bundle: true,
	platform: 'node',
	target: 'node18.18',
	format: 'cjs',
	external: Object.keys(package_.dependencies),
	entryPoints: ['./out/index.js'],
	outfile: './build/index.js',
});
