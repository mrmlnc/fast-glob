import * as assert from 'assert';
import * as path from 'path';

import * as tests from '../tests';

import Reader from './reader';

import * as optionsManager from '../managers/options';

import { IOptions } from '../managers/options';
import { ITask } from '../managers/tasks';

import { Entry } from '../types/entries';

function getEntry(entry?: Partial<Entry>): Entry {
	return Object.assign({
		isFile: () => false,
		isDirectory: () => false,
		isSymbolicLink: () => false,
		path: 'path',
		depth: 1
	} as Entry, entry);
}

class TestReader extends Reader {
	public read(_task: ITask): Array<{}> {
		return [];
	}
}

describe('Providers → Reader', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const options: IOptions = optionsManager.prepare();
			const reader = new TestReader(options);

			assert.ok(reader instanceof Reader);
		});
	});

	describe('.getRootDirectory', () => {
		const options: IOptions = optionsManager.prepare({ cwd: '.' });
		const reader = new TestReader(options);

		it('should returns root directory for reader with global base (.)', () => {
			const expected = process.cwd();

			const actual = reader.getRootDirectory({ base: '.' } as ITask);

			assert.equal(actual, expected);
		});

		it('should returns root directory for reader with non-global base (fixtures)', () => {
			const expected = path.join(process.cwd(), 'fixtures');

			const actual = reader.getRootDirectory({ base: 'fixtures' } as ITask);

			assert.equal(actual, expected);
		});
	});

	describe('.getReaderOptions', () => {
		const options: IOptions = optionsManager.prepare();
		const reader = new TestReader(options);

		it('should returns options for reader with global base (.)', () => {
			const actual = reader.getReaderOptions({
				base: '.',
				patterns: ['**/*'],
				positive: ['**/*'],
				negative: []
			});

			assert.equal(actual.basePath, '');
			assert.equal(actual.sep, '/');
			assert.equal(typeof actual.filter, 'function');
			assert.equal(typeof actual.deep, 'function');
		});

		it('should returns options for reader with non-global base (fixtures)', () => {
			const actual = reader.getReaderOptions({
				base: 'fixtures',
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

	describe('.filter', () => {
		it('should returns false for excluded directory', () => {
			const options: IOptions = optionsManager.prepare();
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/nested',
				isDirectory: () => true
			});

			const actual = reader.filter(entry, ['!**/nested'], ['**/nested']);

			assert.ok(!actual);
		});

		it('should returns true for directories if "onlyFiles" option is disabled', () => {
			const options: IOptions = optionsManager.prepare({ onlyFiles: false });
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/nested',
				isDirectory: () => true
			});

			const actual = reader.filter(entry, ['**/*'], []);

			assert.ok(actual);
		});

		it('should returns false for directories if set "onlyFiles" options', () => {
			const options: IOptions = optionsManager.prepare({ onlyFiles: true });
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/nested',
				isDirectory: () => true
			});

			const actual = reader.filter(entry, ['**/*'], []);

			assert.ok(!actual);
		});

		it('should returns false for files if set "onlyDirectories" options', () => {
			const options: IOptions = optionsManager.prepare({ onlyFiles: false, onlyDirectories: true });
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/nested',
				isFile: () => true
			});

			const actual = reader.filter(entry, ['**/*'], []);

			assert.ok(!actual);
		});

		it('should returns false if patterns not a matched', () => {
			const options: IOptions = optionsManager.prepare();
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/nested/file.md',
				isFile: () => true
			});

			const actual = reader.filter(entry, ['**/*.txt'], []);

			assert.ok(!actual);
		});

		it('should returns false by negative patterns', () => {
			const options: IOptions = optionsManager.prepare();
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/nested/file.md',
				isFile: () => true
			});

			const actual = reader.filter(entry, ['**/*', '!**/*.md'], ['**/*.md']);

			assert.ok(!actual);
		});

		it('should returns true by matched patterns', () => {
			const options: IOptions = optionsManager.prepare();
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/nested/file.md',
				isFile: () => true
			});

			const actual = reader.filter(entry, ['**/*.md'], []);

			assert.ok(actual);
		});

		it('should returns false for files that starting with a period', () => {
			const options: IOptions = optionsManager.prepare();
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/.file.md',
				isFile: () => true
			});

			const actual = reader.filter(entry, ['**/*'], []);

			assert.ok(!actual);
		});

		it('should returns true for files that starting with a period if set "dot" option', () => {
			const options: IOptions = optionsManager.prepare({ dot: true });
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/.file.md',
				isFile: () => true
			});

			const actual = reader.filter(entry, ['**/*'], []);

			assert.ok(actual);
		});
	});

	describe('.deep', () => {
		it('should returns false if deep options is disabled', () => {
			const options: IOptions = optionsManager.prepare({ deep: false });
			const reader = new TestReader(options);

			const entry = getEntry();
			const actual = reader.deep(entry, ['**/*']);

			assert.ok(!actual);
		});

		it('should returns false if specified a limit of depth', () => {
			const options: IOptions = optionsManager.prepare({ deep: 2 });
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'a/b/c',
				isDirectory: () => true,
				depth: 3
			});

			const actual = reader.deep(entry, ['**/*']);

			assert.ok(!actual);
		});

		it('should returns true if has no specified negative patterns', () => {
			const options: IOptions = optionsManager.prepare();
			const reader = new TestReader(options);

			const entry = getEntry();
			const actual = reader.deep(entry, []);

			assert.ok(actual);
		});

		it('should returns true if negative patterns not a matched', () => {
			const options: IOptions = optionsManager.prepare();
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/nested',
				isDirectory: () => true
			});

			const actual = reader.deep(entry, ['**/nested/**']);

			assert.ok(actual);
		});

		it('should returns false for excluded directory by special pattern', () => {
			const options: IOptions = optionsManager.prepare();
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/nested',
				isDirectory: () => true
			});

			const actual = reader.deep(entry, ['**/nested']);

			assert.ok(!actual);
		});

		it('should returns false for directories that starting with a period', () => {
			const options: IOptions = optionsManager.prepare();
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/.directory',
				isDirectory: () => true
			});

			const actual = reader.deep(entry, []);

			assert.ok(!actual);
		});

		it('should returns true for directories that starting with a period if «dot» option is enabled', () => {
			const options: IOptions = optionsManager.prepare({ dot: true });
			const reader = new TestReader(options);

			const entry = getEntry({
				path: 'fixtures/.directory',
				isDirectory: () => true
			});

			const actual = reader.deep(entry, []);

			assert.ok(actual);
		});
	});

	describe('.isEnoentCodeError', () => {
		const options: IOptions = optionsManager.prepare();
		const reader = new TestReader(options);

		it('should returns true', () => {
			const error = new tests.EnoentErrnoException();

			const actual = reader.isEnoentCodeError(error);

			assert.ok(actual);
		});

		it('should returns false', () => {
			const error = new Error();

			const actual = reader.isEnoentCodeError(error);

			assert.ok(!actual);
		});
	});

	describe('.isDotDirectory', () => {
		const options: IOptions = optionsManager.prepare();
		const reader = new TestReader(options);

		it('should returns true', () => {
			const entry = getEntry({
				path: 'fixtures/.directory',
				isDirectory: () => true
			});

			const actual = reader.isDotDirectory(entry);

			assert.ok(actual);
		});

		it('should returns false', () => {
			const entry = getEntry({
				path: 'fixtures/directory',
				isDirectory: () => true
			});

			const actual = reader.isDotDirectory(entry);

			assert.ok(!actual);
		});
	});
});
