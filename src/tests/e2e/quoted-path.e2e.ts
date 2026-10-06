import * as assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
	after,
	before,
	describe,
	it,
} from 'mocha';
import * as fg from '../../index.js';

// Double quotes are not valid filename characters on Windows.
(os.platform() === 'win32' ? describe.skip : describe)('Escaped POSIX double quotes', () => {
	let cwd: string;

	before(async () => {
		cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'fast-glob-quotes-'));
		await Promise.all(['"path', 'pa"th', '"path"'].map(async (directory) => {
			await fs.mkdir(path.join(cwd, directory));
			await fs.writeFile(path.join(cwd, directory, 'file.txt'), '');
		}));
	});

	after(async () => {
		await fs.rm(cwd, { recursive: true, force: true });
	});

	for (const directory of ['"path', 'pa"th', '"path"']) {
		for (const [name, escape] of Object.entries(fg.posix)) {
			// The setup hook initializes cwd before any test runs.
			// eslint-disable-next-line @typescript-eslint/no-loop-func
			it(`should match ${directory} using ${name}`, async () => {
				const pattern = `${escape(directory)}/*.txt`;
				const expected = [`${directory}/file.txt`];

				assert.deepStrictEqual(fg.globSync(pattern, { cwd }), expected);
				assert.deepStrictEqual(await fg.glob(pattern, { cwd }), expected);
				const entries: unknown[] = await Array.fromAsync(fg.globStream(pattern, { cwd }));
				assert.deepStrictEqual(entries, expected);
			});
		}
	}
});
