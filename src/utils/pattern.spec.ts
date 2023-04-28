import * as assert from 'assert';

import * as util from './pattern';

import type { Pattern } from '../types';

describe('Utils → Pattern', () => {
	describe('.isStaticPattern', () => {
		it('should return true for static pattern', () => {
			const actual = util.isStaticPattern('dir');

			assert.ok(actual);
		});

		it('should return false for dynamic pattern', () => {
			const actual = util.isStaticPattern('*');

			assert.ok(!actual);
		});
	});

	describe('.isDynamicPattern', () => {
		describe('Without options', () => {
			it('should return false for an empty string', () => {
				assert.ok(!util.isDynamicPattern(''));
			});

			it('should return true for patterns that include the escape symbol', () => {
				assert.ok(util.isDynamicPattern('\\'));
			});

			it('should return true for everything when the `caseSensitiveMatch` option is disabled', () => {
				assert.ok(util.isDynamicPattern('abc', { caseSensitiveMatch: false }));
			});

			it('should return true for patterns that include common glob symbols', () => {
				assert.ok(util.isDynamicPattern('*'));
				assert.ok(util.isDynamicPattern('abc/*'));
				assert.ok(util.isDynamicPattern('?'));
				assert.ok(util.isDynamicPattern('abc/?'));
				assert.ok(util.isDynamicPattern('!abc'));
			});

			it('should return true for patterns that include regex group symbols', () => {
				assert.ok(util.isDynamicPattern('(a|)'));
				assert.ok(util.isDynamicPattern('(a|b)'));
				assert.ok(util.isDynamicPattern('abc/(a|b)'));
			});

			it('should return true for patterns that include regex character class symbols', () => {
				assert.ok(util.isDynamicPattern('[abc]'));
				assert.ok(util.isDynamicPattern('abc/[abc]'));
				assert.ok(util.isDynamicPattern('[^abc]'));
				assert.ok(util.isDynamicPattern('abc/[^abc]'));
				assert.ok(util.isDynamicPattern('[1-3]'));
				assert.ok(util.isDynamicPattern('abc/[1-3]'));
				assert.ok(util.isDynamicPattern('[[:alpha:][:digit:]]'));
				assert.ok(util.isDynamicPattern('abc/[[:alpha:][:digit:]]'));
			});

			it('should return true for patterns that include glob extension symbols', () => {
				assert.ok(util.isDynamicPattern('@()'));
				assert.ok(util.isDynamicPattern('@(a)'));
				assert.ok(util.isDynamicPattern('@(a|b)'));
				assert.ok(util.isDynamicPattern('abc/!(a|b)'));
				assert.ok(util.isDynamicPattern('*(a|b)'));
				assert.ok(util.isDynamicPattern('?(a|b)'));
				assert.ok(util.isDynamicPattern('+(a|b)'));
			});

			it('should return false for glob extension when the `extglob` option is disabled', () => {
				assert.ok(!util.isDynamicPattern('@()', { extglob: false }));
				assert.ok(!util.isDynamicPattern('@(a)', { extglob: false }));
				assert.ok(!util.isDynamicPattern('@(a|b)', { extglob: false }));
				assert.ok(!util.isDynamicPattern('abc/!(a|b)', { extglob: false }));
				assert.ok(util.isDynamicPattern('*(a|b)', { extglob: true }));
				assert.ok(util.isDynamicPattern('?(a|b)', { extglob: true }));
				assert.ok(!util.isDynamicPattern('+(a|b)', { extglob: false }));
			});

			it('should return true for patterns that include brace expansions symbols', () => {
				assert.ok(util.isDynamicPattern('{,}'));
				assert.ok(util.isDynamicPattern('abc/{a.txt,}'));
				assert.ok(util.isDynamicPattern('{a,}'));
				assert.ok(util.isDynamicPattern('{,b}'));
				assert.ok(util.isDynamicPattern('{a,b}'));
				assert.ok(util.isDynamicPattern('{a,b,c}'));
				assert.ok(util.isDynamicPattern(`{a${','.repeat(999_999)}b}`));
				assert.ok(util.isDynamicPattern('{a,b,{c,d}}'));
				// The second braces pass
				assert.ok(util.isDynamicPattern('{a,b,{c,d}'));
				assert.ok(util.isDynamicPattern('{1..3}'));
				assert.ok(util.isDynamicPattern('abc/{1..3}'));
				assert.ok(util.isDynamicPattern('{2..10..2}'));
			});

			it('should return false for brace extension when the `braceExpansion` option is disabled', () => {
				assert.ok(!util.isDynamicPattern('{,}', { braceExpansion: false }));
				assert.ok(!util.isDynamicPattern('{a,}', { braceExpansion: false }));
				assert.ok(!util.isDynamicPattern('{,b}', { braceExpansion: false }));
				assert.ok(!util.isDynamicPattern('{a,b}', { braceExpansion: false }));
				assert.ok(!util.isDynamicPattern('{1..3}', { braceExpansion: false }));
			});

			it('should return false for "!" symbols when a symbol is not specified first in the string', () => {
				assert.ok(!util.isDynamicPattern('abc!'));
			});

			it('should return false for a completely static pattern', () => {
				assert.ok(!util.isDynamicPattern(''));
				assert.ok(!util.isDynamicPattern('.'));
				assert.ok(!util.isDynamicPattern('abc'));
				assert.ok(!util.isDynamicPattern('~abc'));
				assert.ok(!util.isDynamicPattern('~/abc'));
				assert.ok(!util.isDynamicPattern('+~/abc'));
				assert.ok(!util.isDynamicPattern('@.(abc)'));
				assert.ok(!util.isDynamicPattern('(a b)'));
				assert.ok(!util.isDynamicPattern('(a b)'));
				assert.ok(!util.isDynamicPattern('[abc'));
			});

			it('should return false for unfinished regex character class', () => {
				assert.ok(!util.isDynamicPattern('['));
				assert.ok(!util.isDynamicPattern('['.repeat(999_999)));
				assert.ok(!util.isDynamicPattern('[abc'));
			});

			it('should return false for unfinished regex group', () => {
				assert.ok(!util.isDynamicPattern('(a|b'));
				assert.ok(!util.isDynamicPattern(`${'('.repeat(999_999)}a|b`));
				assert.ok(!util.isDynamicPattern(`(a${'|'.repeat(999_999)}b`));
				assert.ok(!util.isDynamicPattern('abc/(a|b'));
			});

			it('should return false for unfinished glob extension', () => {
				assert.ok(!util.isDynamicPattern('@('));
				assert.ok(!util.isDynamicPattern(`@${'('.repeat(999_999)}a`));
				assert.ok(!util.isDynamicPattern('@(a'));
				assert.ok(!util.isDynamicPattern('@(a|'));
				assert.ok(!util.isDynamicPattern('@(a|b'));
			});

			it('should return false for unfinished brace expansions', () => {
				assert.ok(!util.isDynamicPattern('{'));
				assert.ok(!util.isDynamicPattern('{'.repeat(999_999)));
				assert.ok(!util.isDynamicPattern('{a'));
				assert.ok(!util.isDynamicPattern('{a}'));
				assert.ok(!util.isDynamicPattern('{,'));
				assert.ok(!util.isDynamicPattern('{a,'));
				assert.ok(!util.isDynamicPattern('{a,b'));
				assert.ok(!util.isDynamicPattern(`{a${','.repeat(999_999)}b`));
				assert.ok(!util.isDynamicPattern('{1..'));
				assert.ok(!util.isDynamicPattern(`{1.${'.'.repeat(999_999)}2`));
				assert.ok(!util.isDynamicPattern('{2..10'));
				assert.ok(!util.isDynamicPattern('{2..10.'));
				assert.ok(!util.isDynamicPattern('{2..10..'));
				assert.ok(!util.isDynamicPattern('{2..10..2'));
			});
		});

		describe('With options', () => {
			it('should return true for patterns that include "*?" symbols even when the "extglob" option is disabled', () => {
				assert.ok(util.isDynamicPattern('*(a|b)', { extglob: false }));
				assert.ok(util.isDynamicPattern('?(a|b)', { extglob: false }));
			});

			it('should return true when the "caseSensitiveMatch" option is enabled', () => {
				assert.ok(util.isDynamicPattern('a', { caseSensitiveMatch: false }));
			});

			it('should return false for glob extension when the "extglob" option is disabled', () => {
				assert.ok(!util.isDynamicPattern('@(a|b)', { extglob: false }));
				assert.ok(!util.isDynamicPattern('abc/!(a|b)', { extglob: false }));
				assert.ok(!util.isDynamicPattern('+(a|b)', { extglob: false }));
			});

			it('should return false for brace expansions when the "braceExpansion" option is disabled', () => {
				assert.ok(!util.isDynamicPattern('{a,b}', { braceExpansion: false }));
				assert.ok(!util.isDynamicPattern('{1..3}', { braceExpansion: false }));
			});
		});
	});

	describe('.convertToPositivePattern', () => {
		it('should returns converted positive pattern', () => {
			const expected = '*.js';

			const actual = util.convertToPositivePattern('!*.js');

			assert.strictEqual(actual, expected);
		});

		it('should returns pattern without changes', () => {
			const expected = '*.js';

			const actual = util.convertToPositivePattern('*.js');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.convertToNegativePattern', () => {
		it('should returns converted negative pattern', () => {
			const expected = '!*.js';

			const actual = util.convertToNegativePattern('*.js');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.isNegativePattern', () => {
		it('should returns true', () => {
			const actual = util.isNegativePattern('!*.md');

			assert.ok(actual);
		});

		it('should returns false', () => {
			const actual = util.isNegativePattern('*.md');

			assert.ok(!actual);
		});

		it('should returns false for extglob', () => {
			const actual = util.isNegativePattern('!(a|b|c)');

			assert.ok(!actual);
		});
	});

	describe('.isPositivePattern', () => {
		it('should returns true', () => {
			const actual = util.isPositivePattern('*.md');

			assert.ok(actual);
		});

		it('should returns false', () => {
			const actual = util.isPositivePattern('!*.md');

			assert.ok(!actual);
		});
	});

	describe('.getNegativePatterns', () => {
		it('should returns only negative patterns', () => {
			const expected = ['!*.spec.js'];

			const actual = util.getNegativePatterns(['*.js', '!*.spec.js', '*.ts']);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns empty array', () => {
			const expected: Pattern[] = [];

			const actual = util.getNegativePatterns(['*.js', '*.ts']);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.getPositivePatterns', () => {
		it('should returns only positive patterns', () => {
			const expected = ['*.js', '*.ts'];

			const actual = util.getPositivePatterns(['*.js', '!*.spec.js', '*.ts']);

			assert.deepStrictEqual(actual, expected);
		});

		it('should returns empty array', () => {
			const expected: Pattern[] = [];

			const actual = util.getPositivePatterns(['!*.js', '!*.ts']);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.getPatternsInsideCurrentDirectory', () => {
		it('should return patterns', () => {
			const expected: Pattern[] = ['.', './*', '*', 'a/*'];

			const actual = util.getPatternsInsideCurrentDirectory(['.', './*', '*', 'a/*', '..', '../*', './..', './../*']);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.getPatternsOutsideCurrentDirectory', () => {
		it('should return patterns', () => {
			const expected: Pattern[] = ['..', '../*', './..', './../*'];

			const actual = util.getPatternsOutsideCurrentDirectory(['.', './*', '*', 'a/*', '..', '../*', './..', './../*']);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.isPatternRelatedToParentDirectory', () => {
		it('should be `false` when the pattern refers to the current directory', () => {
			const actual = util.isPatternRelatedToParentDirectory('.');

			assert.ok(!actual);
		});

		it('should be `true` when the pattern equals to `..`', () => {
			const actual = util.isPatternRelatedToParentDirectory('..');

			assert.ok(actual);
		});

		it('should be `true` when the pattern starts with `..` segment', () => {
			const actual = util.isPatternRelatedToParentDirectory('../*');

			assert.ok(actual);
		});

		it('should be `true` when the pattern starts with `./..` segment', () => {
			const actual = util.isPatternRelatedToParentDirectory('./../*');

			assert.ok(actual);
		});
	});

	describe('.getBaseDirectory', () => {
		it('should returns base directory', () => {
			const expected = 'root';

			const actual = util.getBaseDirectory('root/*.js');

			assert.strictEqual(actual, expected);
		});

		it('should returns base directory without slash transformation', () => {
			const expected = '.';

			const actual = util.getBaseDirectory('file-\\(suffix\\).md');

			assert.strictEqual(actual, expected);
		});
	});

	describe('.hasGlobStar', () => {
		it('should returns true for pattern that includes globstar', () => {
			const actual = util.hasGlobStar('**/*.js');

			assert.ok(actual);
		});

		it('should returns false for pattern that has no globstar', () => {
			const actual = util.hasGlobStar('*.js');

			assert.ok(!actual);
		});
	});

	describe('.endsWithSlashGlobStar', () => {
		it('should returns true for pattern that ends with slash and globstar', () => {
			const actual = util.endsWithSlashGlobStar('name/**');

			assert.ok(actual);
		});

		it('should returns false for pattern that has no slash, but ends with globstar', () => {
			const actual = util.endsWithSlashGlobStar('**');

			assert.ok(!actual);
		});

		it('should returns false for pattern that does not ends with globstar', () => {
			const actual = util.endsWithSlashGlobStar('name/**/*');

			assert.ok(!actual);
		});
	});

	describe('.isAffectDepthOfReadingPattern', () => {
		it('should return true for pattern that ends with slash and globstar', () => {
			const actual = util.isAffectDepthOfReadingPattern('name/**');

			assert.ok(actual);
		});

		it('should return true for pattern when the last partial of the pattern is static pattern', () => {
			const actual = util.isAffectDepthOfReadingPattern('**/name');

			assert.ok(actual);
		});

		it('should return false', () => {
			const actual = util.isAffectDepthOfReadingPattern('**/name/*');

			assert.ok(!actual);
		});
	});

	describe('.expandPatternsWithBraceExpansion', () => {
		it('should return an array of expanded patterns with brace expansion', () => {
			const expected = ['a/b/d', 'a/c/d', 'a/*', 'a/b/c'];

			const actual = util.expandPatternsWithBraceExpansion(['a/{b,c}/d', 'a/{*,b/c}']);

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.expandBraceExpansion', () => {
		it('should return an array of expanded patterns with brace expansion without dupes', () => {
			const expected = ['a/b', 'a/c', 'a/c/d'];

			const actual = util.expandBraceExpansion('a/{b,c/d,{b,c}}');

			assert.deepStrictEqual(actual, expected);
		});

		it('should sort expanded patterns by length', () => {
			const expected = ['a///*', 'a/b//*', 'a//c/*', 'a/b/c/*'];

			const actual = util.expandBraceExpansion('a/{b,}/{c,}/*');

			assert.deepStrictEqual(actual, expected);
		});

		it('should filter an empty patterns after expansion', () => {
			const expected = ['a', 'b'];

			const actual = util.expandBraceExpansion('{a,{b,},}');

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.getPatternParts', () => {
		it('should return an array with a single item when the pattern is an empty string', () => {
			const expected: Pattern[] = [''];

			const actual = util.getPatternParts('', {});

			assert.deepStrictEqual(actual, expected);
		});

		it('should return an array with a single item (micromatch/picomatch#58)', () => {
			const expected: Pattern[] = ['a*'];

			const actual = util.getPatternParts('a*', {});

			assert.deepStrictEqual(actual, expected);
		});

		it('should return the correct set of parts for the pattern with a forward slash (micromatch/picomatch#58)', () => {
			const expected: Pattern[] = ['', 'lib', '*'];

			const actual = util.getPatternParts('/lib/*', {});

			assert.deepStrictEqual(actual, expected);
		});

		it('should return an array of pattern parts', () => {
			const expected: Pattern[] = ['a', '*', 'b', '**', 'c'];

			const actual = util.getPatternParts('a/*/b/**/c', {});

			assert.deepStrictEqual(actual, expected);
		});
	});

	describe('.makeRe', () => {
		it('should return regexp for provided pattern', () => {
			const actual = util.makeRe('*.js', {});

			assert.ok(actual instanceof RegExp);
		});
	});

	describe('.convertPatternsToRe', () => {
		it('should return regexps for provided patterns', () => {
			const [actual] = util.convertPatternsToRe(['*.js'], {});

			assert.ok(actual instanceof RegExp);
		});
	});

	describe('.matchAny', () => {
		it('should return true', () => {
			const actual = util.matchAny('fixtures/nested/file.txt', [/fixture/, /fixtures\/nested\/file/]);

			assert.ok(actual);
		});

		it('should return false', () => {
			const actual = util.matchAny('fixtures/directory', [/fixtures\/file/]);

			assert.ok(!actual);
		});
	});

	describe('.removeDuplicateSlashes', () => {
		it('should do not change patterns', () => {
			const action = util.removeDuplicateSlashes;

			assert.strictEqual(action('directory/file.md'), 'directory/file.md');
			assert.strictEqual(action('files{.txt,/file.md}'), 'files{.txt,/file.md}');
		});

		it('should do not change the device path in patterns with UNC parts', () => {
			const action = util.removeDuplicateSlashes;

			assert.strictEqual(action('//?//D://'), '//?/D:/');
			assert.strictEqual(action('//.//D:///'), '//./D:/');
			assert.strictEqual(action('//LOCALHOST//d$//'), '//LOCALHOST/d$/');
			assert.strictEqual(action('//127.0.0.1///d$//'), '//127.0.0.1/d$/');
			assert.strictEqual(action('//./UNC////LOCALHOST///d$//'), '//./UNC/LOCALHOST/d$/');
		});

		it('should remove duplicate slashes in the middle and the of the pattern', () => {
			const action = util.removeDuplicateSlashes;

			assert.strictEqual(action('a//b'), 'a/b');
			assert.strictEqual(action('b///c'), 'b/c');
			assert.strictEqual(action('c/d///'), 'c/d/');
			assert.strictEqual(action('//?//D://'), '//?/D:/');
		});

		it('should form double slashes at the beginning of the pattern', () => {
			const action = util.removeDuplicateSlashes;

			assert.strictEqual(action('///*'), '//*');
			assert.strictEqual(action('////?'), '//?');
			assert.strictEqual(action('///?/D:/'), '//?/D:/');
		});
	});
});
