'use strict';

module.exports = function perf(start) {
	if (!start) {
		return process.hrtime();
	}
	const end = process.hrtime(start);
	return end[0] * 1000 + (end[1] / 1000000);
};