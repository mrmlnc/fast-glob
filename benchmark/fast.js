'use strict';

const perf = require('./perf');
const fglob = require('..');

const start = perf();
fglob('**/*').then((files) => {
	console.log('fast-glob (' + files.length + '): ' + perf(start) + ' ms');
});
