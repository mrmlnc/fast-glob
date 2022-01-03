import * as assert from 'assert';

import * as manager from './patterns';

describe('Managers → Pattern', () => {
	describe('.transform', () => {
		it('should transform patterns with duplicate slashes', () => {
			const expected = ['a/b', 'b/c'];

			const actual = manager.transform(['a/b', 'b//c']);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.removeDuplicateSlashes', () => {
		it('should do not change patterns', () => {
			const action = manager.removeDuplicateSlashes;

			assert.strictEqual(action('directory/file.md'), 'directory/file.md');
			assert.strictEqual(action('files{.txt,/file.md}'), 'files{.txt,/file.md}');
		});

		it('should do not change the device path in patterns with UNC parts', () => {
			const action = manager.removeDuplicateSlashes;

			assert.strictEqual(action('//?//D://'), '//?/D:/');
			assert.strictEqual(action('//.//D:///'), '//./D:/');
			assert.strictEqual(action('//LOCALHOST//d$//'), '//LOCALHOST/d$/');
			assert.strictEqual(action('//127.0.0.1///d$//'), '//127.0.0.1/d$/');
			assert.strictEqual(action('//./UNC////LOCALHOST///d$//'), '//./UNC/LOCALHOST/d$/');
		});

		it('should remove duplicate slashes in the middle and the of the pattern', () => {
			const action = manager.removeDuplicateSlashes;

			assert.strictEqual(action('a//b'), 'a/b');
			assert.strictEqual(action('b///c'), 'b/c');
			assert.strictEqual(action('c/d///'), 'c/d/');
			assert.strictEqual(action('//?//D://'), '//?/D:/');
		});

		it('should form double slashes at the beginning of the pattern', () => {
			const action = manager.removeDuplicateSlashes;

			assert.strictEqual(action('///*'), '//*');
			assert.strictEqual(action('////?'), '//?');
			assert.strictEqual(action('///?/D:/'), '//?/D:/');
		});
	});
});
