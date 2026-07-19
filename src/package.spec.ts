import * as assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import * as process from 'node:process';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'mocha';

const PACKAGE_ENTRY_URL = new URL('index.js', import.meta.url);
const EXPECTED_ENTRY = 'fixtures/file.md';

describe('Package loading', () => {
	it('should work with import', () => {
		const source = `
			import * as fastGlob from ${JSON.stringify(PACKAGE_ENTRY_URL.href)};

			const entries = fastGlob.globSync('fixtures/*.md');

			if (entries.length !== 1 || entries[0] !== ${JSON.stringify(EXPECTED_ENTRY)}) {
				throw new Error('The package loaded with import returned unexpected entries.');
			}
		`;
		const result = spawnSync(process.execPath, ['--input-type=module', '--eval', source], {
			cwd: process.cwd(),
			encoding: 'utf8',
		});

		assert.strictEqual(result.status, 0, result.stderr);
	});

	it('should work with require', () => {
		const source = `
			const fastGlob = require(${JSON.stringify(fileURLToPath(PACKAGE_ENTRY_URL))});
			const entries = fastGlob.globSync('fixtures/*.md');

			if (entries.length !== 1 || entries[0] !== ${JSON.stringify(EXPECTED_ENTRY)}) {
				throw new Error('The package loaded with require returned unexpected entries.');
			}
		`;
		const result = spawnSync(process.execPath, ['--input-type=commonjs', '--eval', source], {
			cwd: process.cwd(),
			encoding: 'utf8',
		});

		assert.strictEqual(result.status, 0, result.stderr);
	});
});
