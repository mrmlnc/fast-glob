import * as assert from 'assert';

import * as manager from './patterns';

describe('Managers → Pattern', () => {
	describe('.transform', () => {
		it('should do not change patterns', () => {
			const expected = [
				'directory/file.md',
				'files{.txt,/file.md}'
			];

			const actual = manager.transform([
				'directory/file.md',
				'files{.txt,/file.md}'
			]);

			assert.deepStrictEqual(actual, expected);
		});

		it('should do not change the device path in patterns with UNC parts', () => {
			const expected = [
				'//?/D:/',
				'//./D:/',
				'//LOCALHOST/d$/',
				'//127.0.0.1/d$/',
				'//./UNC/LOCALHOST/d$/'
			];

			const actual = manager.transform([
				'//?//D://',
				'//.//D:///',
				'//LOCALHOST//d$//',
				'//127.0.0.1///d$//',
				'//./UNC////LOCALHOST///d$//'
			]);

			assert.deepStrictEqual(actual, expected);
		});

		it('should remove duplicate slashes in the middle and the of the pattern', () => {
			const expected = ['a/b', 'b/c', 'c/d/', '//?/D:/'];

			const actual = manager.transform(['a//b', 'b///c', 'c/d///', '//?//D://']);

			assert.deepStrictEqual(actual, expected);
		});

		it('should form double slashes at the beginning of the pattern', () => {
			const expected = ['//*', '//?', '//?/D:/'];

			const actual = manager.transform(['///*', '////?', '///?/D:/']);

			assert.deepStrictEqual(actual, expected);
		});
	});
});
