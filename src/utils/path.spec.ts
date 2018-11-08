import * as assert from 'assert';
import * as path from 'path';

import * as util from './path';

describe('Utils → Path', () => {
	describe('.isDotDirectory', () => {
		it('should return true for dot directory', () => {
			const actual = util.isDotDirectory('fixtures/.directory');

			assert.ok(actual);
		});

		it('should return false for non-dot directory', () => {
			const actual = util.isDotDirectory('fixtures/.directory/directory');

			assert.ok(!actual);
		});
	});

	describe('.normalize', () => {
		it('should return path with converted slashes', () => {
			const expected = 'directory/nested/file.md';

			const actual = util.normalize('directory\\nested/file.md');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.makeAbsolute', () => {
		it('should return normalized filepath', () => {
			const expected = '/something/file.md';

			const actual = util.makeAbsolute(process.cwd(), '/something\\file.md');

			assert.strictEqual(actual, expected);
		});

		it('should return normalized absolute filepath', () => {
			const expected = path.join(process.cwd(), 'file.md').replace(/\\/g, '/');

			const actual = util.makeAbsolute(process.cwd(), 'file.md');

			assert.strictEqual(actual, expected);
		});
	});
});
