import * as assert from 'assert';
import * as path from 'path';

import * as util from './path';

describe('Utils → Path', () => {
	describe('.unixify', () => {
		it('should return path with converted slashes', () => {
			const expected = 'directory/nested/file.md';

			const actual = util.unixify('directory\\nested/file.md');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.makeAbsolute', () => {
		it('should return absolute filepath', () => {
			const expected = path.join(process.cwd(), 'file.md');

			const actual = util.makeAbsolute(process.cwd(), 'file.md');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.escape', () => {
		it('should return pattern without additional escape characters', () => {
			assert.strictEqual(util.escape('\\!abc'), '\\!abc');
			assert.strictEqual(util.escape('\\*'), '\\*');
			assert.strictEqual(util.escape('\\!\\('), '\\!\\(');
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
			assert.strictEqual(util.escapePosixPath('!abc'), '\\!abc');
			assert.strictEqual(util.escapePosixPath('*'), '\\*');
			assert.strictEqual(util.escapePosixPath('?'), '\\?');
			assert.strictEqual(util.escapePosixPath('\\'), '\\\\');
			assert.strictEqual(util.escapePosixPath('()'), '\\(\\)');
			assert.strictEqual(util.escapePosixPath('{}'), '\\{\\}');
			assert.strictEqual(util.escapePosixPath('[]'), '\\[\\]');
			assert.strictEqual(util.escapePosixPath('@('), '\\@\\(');
			assert.strictEqual(util.escapePosixPath('!('), '\\!\\(');
			assert.strictEqual(util.escapePosixPath('*('), '\\*\\(');
			assert.strictEqual(util.escapePosixPath('?('), '\\?\\(');
			assert.strictEqual(util.escapePosixPath('+('), '\\+\\(');
		});
	});

	describe('.escapeWindowsPattern', () => {
		it('should return pattern with escaped glob symbols', () => {
			assert.strictEqual(util.escapeWindowsPath('!abc'), '\\!abc');
			assert.strictEqual(util.escapeWindowsPath('()'), '\\(\\)');
			assert.strictEqual(util.escapeWindowsPath('{}'), '\\{\\}');
			assert.strictEqual(util.escapeWindowsPath('@('), '\\@\\(');
			assert.strictEqual(util.escapeWindowsPath('!('), '\\!\\(');
			assert.strictEqual(util.escapeWindowsPath('+('), '\\+\\(');
		});
	});

	describe('.removeLeadingDotCharacters', () => {
		it('should return path without changes', () => {
			assert.strictEqual(util.removeLeadingDotSegment('../a/b'), '../a/b');
			assert.strictEqual(util.removeLeadingDotSegment('~/a/b'), '~/a/b');
			assert.strictEqual(util.removeLeadingDotSegment('/a/b'), '/a/b');
			assert.strictEqual(util.removeLeadingDotSegment('a/b'), 'a/b');

			assert.strictEqual(util.removeLeadingDotSegment('..\\a\\b'), '..\\a\\b');
			assert.strictEqual(util.removeLeadingDotSegment('~\\a\\b'), '~\\a\\b');
			assert.strictEqual(util.removeLeadingDotSegment('\\a\\b'), '\\a\\b');
			assert.strictEqual(util.removeLeadingDotSegment('a\\b'), 'a\\b');
		});

		it('should return path without leading dit characters', () => {
			assert.strictEqual(util.removeLeadingDotSegment('./a/b'), 'a/b');
			assert.strictEqual(util.removeLeadingDotSegment('.\\a\\b'), 'a\\b');
		});
	});

	describe('.convertPathToPattern', () => {
		it('should return a pattern', () => {
			assert.strictEqual(util.convertPathToPattern('.{directory}'), '.\\{directory\\}');
		});
	});

	describe('.convertPosixPathToPattern', () => {
		it('should escape special characters', () => {
			assert.strictEqual(util.convertPosixPathToPattern('./**\\*'), './\\*\\*\\*');
		});
	});

	describe('.convertWindowsPathToPattern', () => {
		it('should escape special characters', () => {
			assert.strictEqual(util.convertPosixPathToPattern('.{directory}'), '.\\{directory\\}');
		});

		it('should do nothing with escaped glob symbols', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('\\!\\'), '\\!/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\+\\'), '\\+/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\@\\'), '\\@/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\(\\'), '\\(/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\)\\'), '\\)/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\{\\'), '\\{/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\}\\'), '\\}/');

			assert.strictEqual(util.convertWindowsPathToPattern('.\\*'), './*');
			assert.strictEqual(util.convertWindowsPathToPattern('.\\**'), './**');
			assert.strictEqual(util.convertWindowsPathToPattern('.\\**\\*'), './**/*');

			assert.strictEqual(util.convertWindowsPathToPattern('a\\{b,c\\d,{b,c}}'), 'a\\{b,c/d,\\{b,c\\}\\}');
		});

		it('should convert slashes', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('/'), '/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\'), '/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\\\'), '//');
			assert.strictEqual(util.convertWindowsPathToPattern('\\/'), '//');
			assert.strictEqual(util.convertWindowsPathToPattern('\\/\\'), '///');
		});

		it('should convert relative paths', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('file.txt'), 'file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('./file.txt'), './file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('.\\file.txt'), './file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('../file.txt'), '../file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('..\\file.txt'), '../file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('.\\file.txt'), './file.txt');
		});

		it('should convert absolute paths', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('/.file.txt'), '/.file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('/root/.file.txt'), '/root/.file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('\\.file.txt'), '/.file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('\\root\\.file.txt'), '/root/.file.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('\\root/.file.txt'), '/root/.file.txt');
		});

		it('should convert traditional DOS paths', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('D:ShipId.txt'), 'D:ShipId.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('D:/ShipId.txt'), 'D:/ShipId.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('D://ShipId.txt'), 'D://ShipId.txt');

			assert.strictEqual(util.convertWindowsPathToPattern('D:\\ShipId.txt'), 'D:/ShipId.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('D:\\\\ShipId.txt'), 'D://ShipId.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('D:\\/ShipId.txt'), 'D://ShipId.txt');
		});

		it('should convert UNC paths', () => {
			assert.strictEqual(util.convertWindowsPathToPattern('\\\\system07\\'), '//system07/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\\\system07\\c$\\'), '//system07/c$/');
			assert.strictEqual(util.convertWindowsPathToPattern('\\\\Server02\\Share\\Foo.txt'), '//Server02/Share/Foo.txt');

			assert.strictEqual(util.convertWindowsPathToPattern('\\\\127.0.0.1\\c$\\File.txt'), '//127.0.0.1/c$/File.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('\\\\.\\c:\\File.txt'), '//./c:/File.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('\\\\?\\c:\\File.txt'), '//?/c:/File.txt');
			assert.strictEqual(util.convertWindowsPathToPattern('\\\\.\\UNC\\LOCALHOST\\c$\\File.txt'), '//./UNC/LOCALHOST/c$/File.txt');
		});
	});
});
