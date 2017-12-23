import * as assert from 'assert';
import * as fs from 'fs';

import fglob, { IOptions, sync } from './fglob';

import { TEntry } from './types/entries';

const fixtures = [
	'.tmp/a.txt',
	'.tmp/nested/b.txt',
	'.tmp/c.js',
	'.tmp/nested/d.ts',
	'.tmp/e',
	'.tmp/.f'
];

function customTransformer(filepath: string): string {
	return `[${filepath}]`;
}

describe('FastGlob', () => {

	before(() => {
		fs.mkdirSync('.tmp');
		fs.mkdirSync('.tmp/nested');
		fixtures.forEach((fixture) => fs.writeFileSync(fixture, ''));
	});

	describe('Async', () => {
		describe('Patterns', () => {
			it('Single common pattern', async () => {
				const files = await fglob('.tmp/**/*');

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

			it('Single pattern with specific extension', async () => {
				const files = await fglob('.tmp/**/*.txt');

				assert.deepEqual(files.sort(), [
					'.tmp/a.txt',
					'.tmp/nested/b.txt'
				].sort());
			});

			it('Multiple patterns with non-positive pattern', async () => {
				const files = await fglob(['.tmp/**/*', '!.tmp/**/*.txt']);

				assert.deepEqual(files.sort(), [
					'.tmp/.f',
					'.tmp/c.js',
					'.tmp/nested',
					'.tmp/e',
					'.tmp/nested/d.ts'
				].sort());
			});
		});

		describe('Options', () => {
			it('ignore', async () => {
				const files = await fglob('.tmp/**/*', { ignore: '.tmp/**/*.txt' } as IOptions);

				assert.deepEqual(files.sort(), [
					'.tmp/.f',
					'.tmp/c.js',
					'.tmp/nested',
					'.tmp/e',
					'.tmp/nested/d.ts'
				].sort());
			});

			it('stats', async () => {
				const files = await fglob('.tmp/**/*', { stats: true } as IOptions);

				assert.deepEqual(files.map((file) => (file as TEntry).path).sort(), [
					'.tmp/.f',
					'.tmp/c.js',
					'.tmp/nested',
					'.tmp/a.txt',
					'.tmp/e',
					'.tmp/nested/b.txt',
					'.tmp/nested/d.ts'
				].sort());
			});

			it('cwd', async () => {
				const files = await fglob('**/*', { cwd: process.cwd() + '/.tmp/nested' } as IOptions);

				assert.deepEqual(files.sort(), [
					'b.txt',
					'd.ts'
				].sort());
			});

			it('onlyFiles', async () => {
				const files = await fglob('.tmp/**/*', { onlyFiles: true } as IOptions);

				assert.deepEqual(files.sort(), [
					'.tmp/.f',
					'.tmp/a.txt',
					'.tmp/e',
					'.tmp/c.js',
					'.tmp/nested/b.txt',
					'.tmp/nested/d.ts'
				].sort());
			});

			it('onlyDirs', async () => {
				const files = await fglob('.tmp/**/*', { onlyDirs: true } as IOptions);

				assert.deepEqual(files.sort(), [
					'.tmp/nested'
				].sort());
			});

			it('transform', async () => {
				const files = await fglob('.tmp/**/*.txt', { transform: customTransformer } as IOptions);

				assert.deepEqual(files.sort(), [
					'[.tmp/a.txt]',
					'[.tmp/nested/b.txt]'
				].sort());
			});
		});
	});

	describe('Sync', () => {
		describe('Patterns', () => {
			it('Single common pattern', () => {
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

			it('Single pattern with specific extension', () => {
				assert.deepEqual(sync('.tmp/**/*.txt').sort(), [
					'.tmp/a.txt',
					'.tmp/nested/b.txt'
				].sort());
			});

			it('Multiple patterns with non-positive pattern', () => {
				assert.deepEqual(sync(['.tmp/**/*', '!.tmp/**/*.txt']).sort(), [
					'.tmp/.f',
					'.tmp/c.js',
					'.tmp/nested',
					'.tmp/e',
					'.tmp/nested/d.ts'
				].sort());
			});
		});

		describe('Options', () => {
			it('ignore', () => {
				const files = sync('.tmp/**/*', { ignore: '.tmp/**/*.txt' } as IOptions);

				assert.deepEqual(files.sort(), [
					'.tmp/.f',
					'.tmp/c.js',
					'.tmp/nested',
					'.tmp/e',
					'.tmp/nested/d.ts'
				].sort());
			});

			it('stats', () => {
				const files = sync('.tmp/**/*', { stats: true } as IOptions);

				assert.deepEqual(files.map((file) => (file as TEntry).path).sort(), [
					'.tmp/.f',
					'.tmp/c.js',
					'.tmp/nested',
					'.tmp/a.txt',
					'.tmp/e',
					'.tmp/nested/b.txt',
					'.tmp/nested/d.ts'
				].sort());
			});

			it('cwd', () => {
				const files = sync('**/*', { cwd: process.cwd() + '/.tmp/nested' } as IOptions);

				assert.deepEqual(files.sort(), [
					'b.txt',
					'd.ts'
				].sort());
			});

			it('onlyFiles', () => {
				const files = sync('.tmp/**/*', { onlyFiles: true } as IOptions);

				assert.deepEqual(files.sort(), [
					'.tmp/.f',
					'.tmp/a.txt',
					'.tmp/e',
					'.tmp/c.js',
					'.tmp/nested/b.txt',
					'.tmp/nested/d.ts'
				].sort());
			});

			it('onlyDirs', () => {
				const files = sync('.tmp/**/*', { onlyDirs: true } as IOptions);

				assert.deepEqual(files.sort(), [
					'.tmp/nested'
				].sort());
			});

			it('transform', () => {
				const files = sync('.tmp/**/*.txt', { transform: customTransformer } as IOptions);

				assert.deepEqual(files.sort(), [
					'[.tmp/a.txt]',
					'[.tmp/nested/b.txt]'
				].sort());
			});
		});
	});

});
