'use strict';

const perf = require('./perf');
const fglob = require('..');

const start = perf();
fglob('**/*').then((files) => {
	console.log(files.length);
	console.log('time: ' + perf(start) + ' ms');
});
