import * as fs from 'fs';
import * as path from 'path';

function writeFixtureFiles(basedir: string): void {
	for (let i = 0; i < 5; i++) {
		const extension = i % 2 === 0 ? 'txt' : 'md';

		fs.writeFileSync(`${basedir}/file-${i}.${extension}`, '');
	}
}

export function makeFixtures(basedir: string, depth: number): void {
	let currentLevelDir = basedir;

	fs.mkdirSync(currentLevelDir);

	for (let level = 0; level < depth; level++) {
		currentLevelDir = path.join(currentLevelDir, level.toString());

		fs.mkdirSync(currentLevelDir);
		fs.mkdirSync(currentLevelDir + '-a');
		fs.mkdirSync(currentLevelDir + '-b');

		writeFixtureFiles(currentLevelDir + '-a');
		writeFixtureFiles(currentLevelDir + '-b');
	}
}
