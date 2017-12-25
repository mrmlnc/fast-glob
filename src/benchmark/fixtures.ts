import * as path from 'path';

import fs = require('fs-extra');

function writeFixtureFiles(basedir: string): void {
	['txt', 'md'].forEach((extension) => fs.writeFileSync(`${basedir}/file.${extension}`, ''));
}

export function makeFixtures(basedir: string, levelOfNesting: number): void {
	let currentLevelDir = basedir;

	fs.mkdirSync(currentLevelDir);

	for (let level = 0; level < levelOfNesting; level++) {
		currentLevelDir = path.join(currentLevelDir, level.toString());

		fs.mkdirpSync(currentLevelDir + '-a');
		fs.mkdirpSync(currentLevelDir + '-b');

		writeFixtureFiles(currentLevelDir + '-a');
		writeFixtureFiles(currentLevelDir + '-b');
	}
}
