'use strict';

const perf = require('./perf');
const glob = require('glob');

const start = perf();
glob('**/*', { nosort: true }, (err, files) => {
	console.log('node-glob (' + files.length + '): ' + perf(start) + ' ms');
});
