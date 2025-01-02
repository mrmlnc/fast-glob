import * as assert from 'node:assert';

import { Stats, StatsMode } from '@nodelib/fs.macchiato';
import { describe, it } from 'mocha';

import * as util from './fs.js';

describe('Utils → FS', () => {
	describe('.createDirentFromStats', () => {
		it('should convert fs.Stats to fs.Dirent', () => {
			const stats = new Stats({ mode: StatsMode.File });
			const actual = util.createDirentFromStats('name', stats);

			assert.strictEqual(actual.name, 'name');
			assert.ok(!actual.isBlockDevice());
			assert.ok(!actual.isCharacterDevice());
			assert.ok(!actual.isDirectory());
			assert.ok(!actual.isFIFO());
			assert.ok(actual.isFile());
			assert.ok(!actual.isSocket());
			assert.ok(!actual.isSymbolicLink());
		});
	});
});
