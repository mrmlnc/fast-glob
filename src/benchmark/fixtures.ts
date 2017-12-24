import * as fs from 'fs-extra';
import * as path from 'path';

import * as logger from './logger';

function writeFixtureFiles(basedir: string): void {
	['txt', 'md'].forEach((extension) => fs.writeFileSync(`${basedir}/file.${extension}`, ''));
}

export function makeFixtures(basedir: string, levelOfNesting: number): void {
	let currentLevelDir = basedir;

	fs.mkdirSync(currentLevelDir);

	logger.subhead(`Creating ${levelOfNesting} level of fixtures`);

	for (let level = 0; level < levelOfNesting; level++) {
		currentLevelDir = path.join(currentLevelDir, level.toString());

		fs.mkdirpSync(currentLevelDir + '-a');
		fs.mkdirpSync(currentLevelDir + '-b');

		writeFixtureFiles(currentLevelDir + '-a');
		writeFixtureFiles(currentLevelDir + '-b');
	}

	logger.subhead(`Fixtures is created`);
}
