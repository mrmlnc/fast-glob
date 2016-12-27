'use strict';

const perf = require('./perf');
const bglob = require('bash-glob');

const start = perf();
bglob('**/*', { dotglob: true }, (err, files) => {
	console.log(files.length);
	console.log('time: ' + perf(start) + ' ms');
});
