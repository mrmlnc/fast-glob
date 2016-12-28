'use strict';

import * as fs from 'fs';

export function statFile(filepath: string): Promise<fs.Stats> {
	return new Promise((resolve, reject) => {
		fs.stat(filepath, (err, stat) => {
			if (err) {
				return reject(err);
			}
			resolve(stat);
		});
	});
}
