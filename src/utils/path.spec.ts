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

	describe('.escapePattern', () => {
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
});
