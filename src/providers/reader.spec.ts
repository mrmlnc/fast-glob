import * as assert from 'assert';
import * as path from 'path';

import * as tests from '../tests';

import Reader from './reader';

import * as optionsManager from '../managers/options';
import * as pathUtil from '../utils/path';

import { IOptions, IPartialOptions } from '../managers/options';
import { ITask } from '../managers/tasks';

export class TestReader extends Reader<Array<{}>> {
	public read(_task: ITask): Array<{}> {
		return [];
	}
}

export function getReader(options?: IPartialOptions): TestReader {
	const preparedOptions: IOptions = optionsManager.prepare(options);

	return new TestReader(preparedOptions);
}

describe('Providers → Reader', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const reader = getReader();

			assert.ok(reader instanceof Reader);
		});
	});

	describe('.getRootDirectory', () => {
		it('should return root directory for reader with global base (.)', () => {
			const reader = getReader();

			const expected = process.cwd();

			const actual = reader.getRootDirectory({ base: '.' } as ITask);

			assert.equal(actual, expected);
		});

		it('should return root directory for reader with non-global base (fixtures)', () => {
			const reader = getReader();

			const expected = path.join(process.cwd(), 'fixtures');

			const actual = reader.getRootDirectory({ base: 'fixtures' } as ITask);

			assert.equal(actual, expected);
		});
	});

	describe('.getReaderOptions', () => {
		it('should return options for reader with global base (.)', () => {
			const reader = getReader();

			const actual = reader.getReaderOptions({
				base: '.',
				dynamic: true,
				patterns: ['**/*'],
				positive: ['**/*'],
				negative: []
			});

			assert.equal(actual.basePath, '');
			assert.equal(actual.sep, '/');
			assert.equal(typeof actual.filter, 'function');
			assert.equal(typeof actual.deep, 'function');
		});

		it('should return options for reader with non-global base (fixtures)', () => {
			const reader = getReader();

			const actual = reader.getReaderOptions({
				base: 'fixtures',
				dynamic: true,
				patterns: ['**/*'],
				positive: ['**/*'],
				negative: []
			});

			assert.equal(actual.basePath, 'fixtures');
			assert.equal(actual.sep, '/');
			assert.equal(typeof actual.filter, 'function');
			assert.equal(typeof actual.deep, 'function');
		});
	});

	describe('.getMicromatchOptions', () => {
		it('should return options for micromatch', () => {
			const reader = getReader();

			const expected: micromatch.Options = {
				dot: false,
				matchBase: false,
				nobrace: false,
				nocase: false,
				noext: false,
				noglobstar: false
			};

			const actual = reader.getMicromatchOptions();

			assert.deepEqual(actual, expected);
		});
	});

	describe('.transform', () => {
		describe('The «markDirectories» option', () => {
			it('should return mark directory when option is enabled', () => {
				const reader = getReader({ markDirectories: true });

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const expected: string = 'fixtures/directory/';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});

			it('should do nothing with file when option is enabled', () => {
				const reader = getReader({ markDirectories: true });

				const entry = tests.getFileEntry(false /** dot */);

				const expected: string = 'fixtures/file.txt';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});

			it('should return non-marked directory when option is disabled', () => {
				const reader = getReader();

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const expected: string = 'fixtures/directory';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});
		});

		describe('The «absolute» option', () => {
			it('should return transformed entry when option is provided', () => {
				const reader = getReader({ absolute: true });

				const entry = tests.getFileEntry(false /** dot */);

				const expected: string = pathUtil.normalize(path.join(process.cwd(), 'fixtures/file.txt'));

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});

			it('should return do nothing when option is not provided', () => {
				const reader = getReader();

				const entry = tests.getFileEntry(false /** dot */);

				const expected: string = 'fixtures/file.txt';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});
		});

		describe('The «transform» option', () => {
			it('should return transformed entry when option is provided', () => {
				const reader = getReader({ transform: () => 'cake' });

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const expected: string = 'cake';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});

			it('should return do nothing when option is not provided', () => {
				const reader = getReader();

				const entry = tests.getDirectoryEntry(false /** dot */, false /** isSymbolicLink */);

				const expected: string = 'fixtures/directory';

				const actual = reader.transform(entry);

				assert.equal(actual, expected);
			});
		});
	});

	describe('.isEnoentCodeError', () => {
		it('should return true for ENOENT error', () => {
			const reader = getReader();

			const error = new tests.EnoentErrnoException();

			const actual = reader.isEnoentCodeError(error);

			assert.ok(actual);
		});

		it('should return false for non-ENOENT error', () => {
			const reader = getReader();

			const error = new Error();

			const actual = reader.isEnoentCodeError(error);

			assert.ok(!actual);
		});
	});
});
