import * as assert from 'assert';

import * as util from './pattern';

import { Pattern } from '../types/patterns';

describe('Utils → Pattern', () => {
	describe('.convertToPositivePattern', () => {
		it('should returns converted positive pattern', () => {
			const expected: Pattern = '*.js';

			const actual = util.convertToPositivePattern('!*.js');

			assert.equal(actual, expected);
		});
	});

	describe('.convertToNegativePattern', () => {
		it('should returns converted negative pattern', () => {
			const expected: Pattern = '!*.js';

			const actual = util.convertToNegativePattern('*.js');

			assert.equal(actual, expected);
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
			const expected: Pattern[] = ['!*.spec.js'];

			const actual = util.getNegativePatterns(['*.js', '!*.spec.js', '*.ts']);

			assert.deepEqual(actual, expected);
		});

		it('should returns empty array', () => {
			const expected: Pattern[] = [];

			const actual = util.getNegativePatterns(['*.js', '*.ts']);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.getPositivePatterns', () => {
		it('should returns only positive patterns', () => {
			const expected: Pattern[] = ['*.js', '*.ts'];

			const actual = util.getPositivePatterns(['*.js', '!*.spec.js', '*.ts']);

			assert.deepEqual(actual, expected);
		});

		it('should returns empty array', () => {
			const expected: Pattern[] = [];

			const actual = util.getPositivePatterns(['!*.js', '!*.ts']);

			assert.deepEqual(actual, expected);
		});
	});

	describe('.getBaseDirectory', () => {
		it('should returns base directory', () => {
			const expected = 'root';

			const actual = util.getBaseDirectory('root/*.js');

			assert.equal(actual, expected);
		});
	});

	describe('.hasGlobStar', () => {
		it('should returns true', () => {
			const actual = util.hasGlobStar('**/*.js');

			assert.ok(actual);
		});

		it('should returns false', () => {
			const actual = util.hasGlobStar('*.js');

			assert.ok(!actual);
		});
	});

	describe('.makePatternRe', () => {
		it('should return regexp for provided pattern', () => {
			const expected: RegExp = /^(?:(?:(?:\.(?:\/|\\))(?=.))?(?!\/)(?!\.)(?=.)[^\/]*?\.js(?:(?:\/|\\)|$))$/;

			const actual = util.makeRe('*.js', {});

			assert.equal(actual.source, expected.source);
		});
	});

	describe('.convertPatternsToRe', () => {
		it('should return regexps for provided patterns', () => {
			const expected: RegExp = /^(?:(?:(?:\.(?:\/|\\))(?=.))?(?!\/)(?!\.)(?=.)[^\/]*?\.js(?:(?:\/|\\)|$))$/;

			const [actual] = util.convertPatternsToRe(['*.js'], {});

			assert.equal(actual.source, expected.source);
		});
	});
	describe('.matchAny', () => {
		it('should return true', () => {
			const actual = util.matchAny('fixtures/file.txt', [/fixture/, /fixtures\/file/]);

			assert.ok(actual);
		});

		it('should return false', () => {
			const actual = util.matchAny('fixtures/directory', [/fixtures\/file/]);

			assert.ok(!actual);
		});
	});

	describe('.match', () => {
		it('should return false by negative patterns', () => {
			const actual = util.match('fixtures/file.txt', [], [/fixtures\/file/]);

			assert.ok(!actual);
		});

		it('should return false by positive patterns', () => {
			const actual = util.match('fixtures/file.txt', [/fixtures\/file\.md/], []);

			assert.ok(!actual);
		});

		it('should return true', () => {
			const actual = util.match('fixtures/file.txt', [/fixtures\/file\.txt/], []);

			assert.ok(actual);
		});
	});
});
