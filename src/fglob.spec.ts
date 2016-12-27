'use strict';

import * as assert from 'assert';
import * as fs from 'fs';

import fglob, { sync } from './fglob';

const fixtures = [
	'.tmp/a.txt',
	'.tmp/nested/b.txt',
	'.tmp/c.js',
	'.tmp/nested/d.ts',
	'.tmp/e',
	'.tmp/.f'
];

function readFilePromise(filepath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(filepath, (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data.toString());
		})
	});
}

describe('fGlob - Async', () => {

	before(() => {
		fs.mkdirSync('.tmp');
		fs.mkdirSync('.tmp/nested');
		fixtures.forEach(fs.writeFileSync)
	});

	it('**/*', () => {
		return fglob('.tmp/**/*').then((files) => {
			assert.deepEqual(files.sort(), [
				'.tmp/.f',
				'.tmp/c.js',
				'.tmp/nested',
				'.tmp/a.txt',
				'.tmp/e',
				'.tmp/nested/b.txt',
				'.tmp/nested/d.ts'
			].sort());
		});
	});

	it('**/*.txt', () => {
		return fglob('.tmp/**/*.txt').then((files) => {
			assert.deepEqual(files.sort(), [
				'.tmp/a.txt',
				'.tmp/nested/b.txt'
			].sort());
		});
	});

	it('**/*, !**/*.txt', () => {
		return fglob(['.tmp/**/*', '!.tmp/**/*.txt']).then((files) => {
			assert.deepEqual(files.sort(), [
				'.tmp/.f',
				'.tmp/c.js',
				'.tmp/nested',
				'.tmp/e',
				'.tmp/nested/d.ts'
			].sort());
		});
	});

	it('Options -> ignore', () => {
		return fglob('.tmp/**/*', { ignore: '.tmp/**/*.txt' }).then((files) => {
			assert.deepEqual(files.sort(), [
				'.tmp/.f',
				'.tmp/c.js',
				'.tmp/nested',
				'.tmp/e',
				'.tmp/nested/d.ts'
			].sort());
		});
	});

	it('Options -> stats', () => {
		return fglob('.tmp/**/*', { stats: true }).then((files) => {
			assert.deepEqual(files.map((file) => (<any>file).path).sort(), [
				'.tmp/.f',
				'.tmp/c.js',
				'.tmp/nested',
				'.tmp/a.txt',
				'.tmp/e',
				'.tmp/nested/b.txt',
				'.tmp/nested/d.ts'
			].sort());
		});
	});

	it('Options -> cwd', () => {
		return fglob('**/*', { cwd: process.cwd() + '/.tmp/nested' }).then((files) => {
			assert.deepEqual(files.sort(), [
				'b.txt',
				'd.ts'
			].sort());
		});
	});

	it('Options -> onlyFiles', () => {
		return fglob('.tmp/**/*', { onlyFiles: true }).then((files) => {
			assert.deepEqual(files.sort(), [
				'.tmp/.f',
				'.tmp/a.txt',
				'.tmp/e',
				'.tmp/c.js',
				'.tmp/nested/b.txt',
				'.tmp/nested/d.ts'
			].sort());
		});
	});

	it('Options -> onlyDirs', () => {
		return fglob('.tmp/**/*', { onlyDirs: true }).then((files) => {
			assert.deepEqual(files.sort(), [
				'.tmp/nested'
			].sort());
		});
	});

	it('Options -> transform', () => {
		return fglob('.tmp/**/*.txt', { transform: readFilePromise })
			.then((files) => Promise.all(files))
			.then((files) => {
				assert.deepEqual(files.sort(), [
					'0',
					'1'
				].sort());
			});
	});

	it('Sync API', () => {
		assert.deepEqual(sync('.tmp/**/*').sort(), [
			'.tmp/.f',
			'.tmp/c.js',
			'.tmp/nested',
			'.tmp/a.txt',
			'.tmp/e',
			'.tmp/nested/b.txt',
			'.tmp/nested/d.ts'
		].sort());
	});

	it('Sync API & stats', () => {
		const files = sync('.tmp/**/*', { stats: true });
		assert.deepEqual(files.map((file) => (<any>file).path).sort(), [
			'.tmp/.f',
			'.tmp/c.js',
			'.tmp/nested',
			'.tmp/a.txt',
			'.tmp/e',
			'.tmp/nested/b.txt',
			'.tmp/nested/d.ts'
		].sort());
	});

});
