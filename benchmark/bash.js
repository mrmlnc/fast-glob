'use strict';

const perf = require('./perf');
const bglob = require('bash-glob');

const start = perf();
bglob('**/*', (err, files) => {
	console.log('bash-glob (' + files.length + '): ' + perf(start) + ' ms');
});
