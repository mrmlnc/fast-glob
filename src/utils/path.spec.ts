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

	describe('.platformify', () => {
		it('should return path with converted slashes', () => {
			const expected = path.join('directory', 'nested', 'file.md');

			const actual = util.platformify('directory/nested/file.md');

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
});
