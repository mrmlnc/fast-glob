import * as assert from 'node:assert';
import * as path from 'node:path';

import { describe, it } from 'mocha';

import * as util from './path.js';

describe('Utils → Path', () => {
	describe('.makeAbsolute', () => {
		it('should return absolute filepath', () => {
			const expected = path.join(process.cwd(), 'file.md');

			const actual = util.makeAbsolute(process.cwd(), 'file.md');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.escape', () => {
		it('should return pattern without additional escape characters', () => {
			assert.strictEqual(util.escape(String.raw`\!abc`), String.raw`\!abc`);
			assert.strictEqual(util.escape(String.raw`\*`), String.raw`\*`);
			assert.strictEqual(util.escape(String.raw`\!\(`), String.raw`\!\(`);
		});

		it('should return pattern without escape characters', () => {
			assert.strictEqual(util.escape('abc!'), 'abc!');
			assert.strictEqual(util.escape('abc/!abc'), 'abc/!abc');
			assert.strictEqual(util.escape('+abc'), '+abc');
			assert.strictEqual(util.escape('abc+'), 'abc+');
			assert.strictEqual(util.escape('@abc'), '@abc');
			assert.strictEqual(util.escape('abc@'), 'abc@');
		});
	});

	describe('.escapePosixPattern', () => {
		it('should return pattern with escaped glob symbols', () => {
			assert.strictEqual(util.escapePosixPath('!abc'), String.raw`\!abc`);
			assert.strictEqual(util.escapePosixPath('*'), String.raw`\*`);
			assert.strictEqual(util.escapePosixPath('?'), String.raw`\?`);
			assert.strictEqual(util.escapePosixPath('\\'), '\\\\');
			assert.strictEqual(util.escapePosixPath('()'), String.raw`\(\)`);
			assert.strictEqual(util.escapePosixPath('{}'), String.raw`\{\}`);
			assert.strictEqual(util.escapePosixPath('[]'), String.raw`\[\]`);
			assert.strictEqual(util.escapePosixPath('@('), String.raw`\@\(`);
			assert.strictEqual(util.escapePosixPath('!('), String.raw`\!\(`);
			assert.strictEqual(util.escapePosixPath('*('), String.raw`\*\(`);
			assert.strictEqual(util.escapePosixPath('?('), String.raw`\?\(`);
			assert.strictEqual(util.escapePosixPath('+('), String.raw`\+\(`);
		});
	});

	describe('.escapeWindowsPattern', () => {
		it('should return pattern with escaped glob symbols', () => {
			assert.strictEqual(util.escapeWindowsPath('!abc'), String.raw`\!abc`);
			assert.strictEqual(util.escapeWindowsPath('()'), String.raw`\(\)`);
			assert.strictEqual(util.escapeWindowsPath('{}'), String.raw`\{\}`);
			assert.strictEqual(util.escapeWindowsPath('[]'), String.raw`\[\]`);
			assert.strictEqual(util.escapeWindowsPath('@('), String.raw`\@\(`);
			assert.strictEqual(util.escapeWindowsPath('!('), String.raw`\!\(`);
			assert.strictEqual(util.escapeWindowsPath('+('), String.raw`\+\(`);
		});
	});

	describe('.removeLeadingDotCharacters', () => {
		it('should return path without changes', () => {
			assert.strictEqual(util.removeLeadingDotSegment('../a/b'), '../a/b');
			assert.strictEqual(util.removeLeadingDotSegment('~/a/b'), '~/a/b');
			assert.strictEqual(util.removeLeadingDotSegment('/a/b'), '/a/b');
			assert.strictEqual(util.removeLeadingDotSegment('a/b'), 'a/b');

			assert.strictEqual(util.removeLeadingDotSegment(String.raw`..\a\b`), String.raw`..\a\b`);
			assert.strictEqual(util.removeLeadingDotSegment(String.raw`~\a\b`), String.raw`~\a\b`);
			assert.strictEqual(util.removeLeadingDotSegment(String.raw`\a\b`), String.raw`\a\b`);
			assert.strictEqual(util.removeLeadingDotSegment(String.raw`a\b`), String.raw`a\b`);
		});

		it('should return path without leading dit characters', () => {
			assert.strictEqual(util.removeLeadingDotSegment('./a/b'), 'a/b');
			assert.strictEqual(util.removeLeadingDotSegment(String.raw`.\a\b`), String.raw`a\b`);
		});
	});

	describe('.convertPathToPattern', () => {
		it('should return a pattern', () => {
			assert.strictEqual(util.convertPathToPattern('.{directory}'), String.raw`.\{directory\}`);
		});
	});

	describe('.convertPosixPathToPattern', () => {
		it('should escape special characters', () => {
			assert.strictEqual(util.convertPosixPathToPattern(String.raw`./**\*`), String.raw`./\*\*\*`);
		});
	});

	describe('.convertWindowsPathToPattern', () => {
		it('should escape special characters', () => {
			assert.strictEqual(util.convertPosixPathToPattern('.{directory}'), String.raw`.\{directory\}`);
		});

		it('should do nothing with escaped glob symbols', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('\\!\\'), String.raw`\!/`);
			assert.strictEqual(util.convertWindowsPathToPattern('\\+\\'), String.raw`\+/`);
			assert.strictEqual(util.convertWindowsPathToPattern('\\@\\'), String.raw`\@/`);
			assert.strictEqual(util.convertWindowsPathToPattern('\\(\\'), String.raw`\(/`);
			assert.strictEqual(util.convertWindowsPathToPattern('\\)\\'), String.raw`\)/`);
			assert.strictEqual(util.convertWindowsPathToPattern('\\{\\'), String.raw`\{/`);
			assert.strictEqual(util.convertWindowsPathToPattern('\\}\\'), String.raw`\}/`);
			assert.strictEqual(util.convertWindowsPathToPattern('\\[\\'), String.raw`\[/`);
			assert.strictEqual(util.convertWindowsPathToPattern('\\]\\'), String.raw`\]/`);

			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`.\*`), './*');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`.\**`), './**');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`.\**\*`), './**/*');

			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`a\{b,c\d,{b,c}}`), String.raw`a\{b,c/d,\{b,c\}\}`);
		});

		it('should convert slashes', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('/'), '/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\'), '/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\\\'), '//');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`\/`), '//');
			assert.strictEqual(util.convertWindowsPathToPattern('\\/\\'), '///');
		});

		it('should convert relative paths', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('file.txt'), 'file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('./file.txt'), './file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`.\file.txt`), './file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('../file.txt'), '../file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`..\file.txt`), '../file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`.\file.txt`), './file.txt');
		});

		it('should convert absolute paths', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('/.file.txt'), '/.file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('/root/.file.txt'), '/root/.file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`\.file.txt`), '/.file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`\root\.file.txt`), '/root/.file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`\root/.file.txt`), '/root/.file.txt');
		});

		it('should convert traditional DOS paths', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('D:ShipId.txt'), 'D:ShipId.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('D:/ShipId.txt'), 'D:/ShipId.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('D://ShipId.txt'), 'D://ShipId.txt');

			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`D:\ShipId.txt`), 'D:/ShipId.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`D:\\ShipId.txt`), 'D://ShipId.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`D:\/ShipId.txt`), 'D://ShipId.txt');
		});

		it('should convert UNC paths', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('\\\\system07\\'), '//system07/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\\\system07\\c$\\'), '//system07/c$/');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`\\Server02\Share\Foo.txt`), '//Server02/Share/Foo.txt');

			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`\\127.0.0.1\c$\File.txt`), '//127.0.0.1/c$/File.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`\\.\c:\File.txt`), '//./c:/File.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`\\?\c:\File.txt`), '//?/c:/File.txt');
			assert.strictEqual(util.convertWindowsPathToPattern(String.raw`\\.\UNC\LOCALHOST\c$\File.txt`), '//./UNC/LOCALHOST/c$/File.txt');
		});
	});
});
