'use strict';

const perf = require('./perf');
const glob = require('glob');

const start = perf();
glob('**/*', { nosort: true }, (err, files) => {
	console.log(files.length);
	console.log('time: ' + perf(start) + ' ms');
});
