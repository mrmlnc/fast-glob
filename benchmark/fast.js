'use strict';

const perf = require('./perf');
const fglob = require('..');

const options = process.argv[2] === 'native' ? {} : { bashNative: [] };
const suffix = process.argv[2] === 'native' ? 'native' : 'fast';

const start = perf();
fglob('**/*', options).then((files) => {
	console.log(`fast-glob (${files.length}) as ${suffix}: ` + perf(start) + ' ms');
});
