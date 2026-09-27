import * as fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import * as os from 'node:os';
import * as path from 'node:path';
import { after, before, describe } from 'mocha';
import * as runner from '../runner.js';

describe('Patterns with prototype property names', () => {
	const cwd = path.join(os.tmpdir(), `fast-glob-prototype-${randomUUID()}`);

	before(() => {
		fs.mkdirSync(cwd);

		for (const name of ['__proto__', 'constructor', 'toString', 'normal']) {
			fs.mkdirSync(path.join(cwd, name));
			fs.writeFileSync(path.join(cwd, name, 'file.md'), '');
			fs.writeFileSync(path.join(cwd, name, 'file.txt'), '');
		}
	});

	after(() => {
		fs.rmSync(cwd, { recursive: true, force: true });
	});

	runner.suite('Prototype bases', {
		tests: [
			{ pattern: '__proto__/file.md', options: { cwd }, expected: () => ['__proto__/file.md'] },
			{ pattern: '__proto__/*', options: { cwd }, expected: () => ['__proto__/file.md', '__proto__/file.txt'] },
			{ pattern: ['__proto__/*.md', '__proto__/*.txt'], options: { cwd }, expected: () => ['__proto__/file.md', '__proto__/file.txt'] },
			{ pattern: ['__proto__/*', 'normal/*.md'], options: { cwd }, expected: () => ['__proto__/file.md', '__proto__/file.txt', 'normal/file.md'] },
			{ pattern: '__proto__/*', options: { cwd, ignore: ['**/*.txt'] }, expected: () => ['__proto__/file.md'] },
			{ pattern: ['*', '__proto__/*.md'], options: { cwd }, expected: () => ['__proto__/file.md'] },
			{ pattern: ['constructor/*.md', 'toString/*.md'], options: { cwd }, expected: () => ['constructor/file.md', 'toString/file.md'] },
		],
	});
});
