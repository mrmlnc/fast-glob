import * as assert from 'node:assert';
import * as path from 'node:path';
import * as process from 'node:process';
import { describe, it } from 'mocha';
import Settings, { type Options } from '../../settings.js';
import * as tests from '../../tests/index.js';
import type { EntryFilterFunction, Pattern, Entry } from '../../types/index.js';
import EntryFilter from './entry.js';

type FilterOptions = {
	positive: Pattern[];
	negative?: Pattern[];
	options?: Options;
};

const FILE_ENTRY = tests.entry.builder().path('root/file.txt').file().build();
const SOCKET_ENTRY = tests.entry.builder().path('/tmp/test.sock').socket().build();
const DIRECTORY_ENTRY = tests.entry.builder().path('root/directory').directory().build();

function getEntryFilterInstance(options?: Options): EntryFilter {
	const settings = new Settings(options);

	return new EntryFilter(settings, {
		dot: settings.dot,
	});
}

function getFilter(options: FilterOptions): EntryFilterFunction {
	const negative = options.negative ?? [];

	return getEntryFilterInstance(options.options).getFilter(options.positive, negative);
}

function isAccepted(entry: Entry, options: FilterOptions): boolean {
	const filter = getFilter(options);

	return filter(entry);
}

function accept(entry: Entry, options: FilterOptions): void {
	assert.strictEqual(isAccepted(entry, options), true);
}

function reject(entry: Entry, options: FilterOptions): void {
	assert.strictEqual(isAccepted(entry, options), false);
}

describe('Providers → Filters → Entry', () => {
	describe('Constructor', () => {
		it('should create instance of class', () => {
			const filter = getEntryFilterInstance();

			assert.ok(filter instanceof EntryFilter);
		});
	});

	describe('.getFilter', () => {
		describe('options.unique', () => {
			it('should do not build the index when an option is disabled', () => {
				const filterInstance = getEntryFilterInstance({ unique: false });

				const filter = filterInstance.getFilter(['**/*'], []);

				filter(FILE_ENTRY);

				assert.strictEqual(filterInstance.index.size, 0);
			});

			it('should do not add an entry to the index when an entry does not match to patterns', () => {
				const filterInstance = getEntryFilterInstance();

				const filter = filterInstance.getFilter(['**/*.unrelated-file-extension'], []);

				filter(FILE_ENTRY);

				assert.strictEqual(filterInstance.index.size, 0);
			});

			it('should reject a duplicate entry', () => {
				const filter = getFilter({
					positive: ['**/*'],
				});

				filter(FILE_ENTRY);

				const isActual = filter(FILE_ENTRY);

				assert.ok(!isActual);
			});

			it('should reject a duplicate entry when the two entries differ only by the leading dot segment', () => {
				const first = tests.entry.builder().path('file.txt').file().build();
				const second = tests.entry.builder().path('./file.txt').file().build();

				const filter = getFilter({
					positive: ['*', './file.txt'],
				});

				assert.ok(filter(first));
				assert.ok(!filter(second));
			});

			it('should accept a duplicate entry when an option is disabled', () => {
				const filter = getFilter({
					positive: ['**/*'],
					options: { unique: false },
				});

				filter(FILE_ENTRY);

				const isActual = filter(FILE_ENTRY);

				assert.ok(isActual);
			});
		});

		describe('options.onlyFiles', () => {
			it('should reject a directory entry', () => {
				reject(DIRECTORY_ENTRY, {
					positive: ['**/*'],
					options: { onlyFiles: true },
				});
			});

			it('should accept a directory entry', () => {
				accept(DIRECTORY_ENTRY, {
					positive: ['**/*'],
					options: { onlyFiles: false },
				});
			});

			it('should accept a file entry', () => {
				accept(FILE_ENTRY, {
					positive: ['**/*'],
					options: { onlyFiles: true },
				});
			});

			it('should accept a socket entry', () => {
				accept(SOCKET_ENTRY, {
					positive: ['**/*'],
					options: { onlyFiles: true },
				});
			});
		});

		describe('options.onlyDirectories', () => {
			it('should reject a file entry', () => {
				reject(FILE_ENTRY, {
					positive: ['**/*'],
					options: { onlyDirectories: true },
				});
			});

			it('should reject a socket entry', () => {
				reject(SOCKET_ENTRY, {
					positive: ['**/*'],
					options: { onlyDirectories: true },
				});
			});

			it('should accept a directory entry', () => {
				accept(DIRECTORY_ENTRY, {
					positive: ['**/*'],
					options: { onlyDirectories: true },
				});
			});
		});

		describe('options.absolute', () => {
			it('should reject when an entry match to the negative pattern', () => {
				reject(FILE_ENTRY, {
					positive: ['**/*'],
					negative: ['**/*'],
					options: { absolute: true },
				});
			});

			it('should reject when an entry match to the negative pattern with absolute path', () => {
				const negative = path.posix.join(process.cwd().replaceAll('\\', '/'), '**', '*');

				reject(FILE_ENTRY, {
					positive: ['**/*'],
					negative: [negative],
					options: { absolute: true },
				});
			});

			it('should accept when an entry does not match to the negative pattern', () => {
				accept(FILE_ENTRY, {
					positive: ['**/*'],
					negative: ['*'],
					options: { absolute: true },
				});
			});

			it('should accept when an entry does not match to the negative pattern with absolute path', () => {
				const negative = path.posix.join(process.cwd().replaceAll('\\', '/'), 'non-root', '**', '*');

				accept(FILE_ENTRY, {
					positive: ['**/*'],
					negative: [negative],
					options: { absolute: true },
				});
			});
		});

		describe('options.baseNameMatch', () => {
			it('should reject an entry', () => {
				reject(FILE_ENTRY, {
					positive: ['file.txt'],
					options: { baseNameMatch: false },
				});
			});

			it('should accept an entry', () => {
				accept(FILE_ENTRY, {
					// The task manager adds globstar for patterns without slash.
					positive: ['**/file.txt'],
					options: { baseNameMatch: true },
				});
			});
		});

		describe('Rooted negative patterns', () => {
			const { root } = path.parse(process.cwd());

			it('should use the cwd root rather than its directory', () => {
				const entry = tests.entry.builder().path('/root/file.txt').file().build();

				reject(entry, {
					positive: ['/root/file.txt'],
					negative: ['/root/file.txt'],
					options: { cwd: path.join(root, 'workspace'), absolute: true },
				});
			});

			it('should use the cwd drive on Windows', () => {
				const entry = tests.entry.builder().path('X:/root/file.txt').file().build();
				const isActual = isAccepted(entry, {
					positive: ['**/*'],
					negative: ['/root/file.txt'],
					options: { cwd: 'X:/workspace', absolute: true },
				});

				assert.strictEqual(isActual, !tests.platform.isWindows());
			});

			it('should not apply a rooted negative pattern to a different drive', () => {
				const entry = tests.entry.builder().path('Y:/root/file.txt').file().build();

				accept(entry, {
					positive: ['**/*'],
					negative: ['/root/file.txt'],
					options: { cwd: 'X:/workspace', absolute: true },
				});
			});

			it('should preserve explicit drives independently of cwd', () => {
				const entry = tests.entry.builder().path('Y:/root/file.txt').file().build();
				const options = { cwd: 'X:/workspace', absolute: true };

				reject(entry, { positive: ['**/*'], negative: ['Y:/root/file.txt'], options });
				accept(entry, { positive: ['**/*'], negative: ['X:/root/file.txt'], options });
			});

			for (const share of ['share', 'share[1]', 'share{one,two}']) {
				it(`should use the literal UNC share "${share}" of cwd on Windows`, () => {
					const isActual = isAccepted(FILE_ENTRY, {
						positive: ['**/*'],
						negative: ['/workspace/root/file.txt'],
						options: { cwd: `//server/${share}/workspace`, absolute: true },
					});

					assert.strictEqual(isActual, !tests.platform.isWindows());
				});
			}

			it('should not interpret glob characters in the cwd share as a pattern', () => {
				const entry = tests.entry.builder().path('//server/share1/workspace/root/file.txt').file().build();

				accept(entry, {
					positive: ['**/*'],
					negative: ['/workspace/root/file.txt'],
					options: { cwd: '//server/share[1]/workspace', absolute: true },
				});
			});

			it('should preserve explicit UNC roots on Windows', () => {
				const options = { cwd: '//server/share/workspace', absolute: true };
				const isActual = isAccepted(FILE_ENTRY, {
					positive: ['**/*'],
					negative: ['//server/share/workspace/root/file.txt'],
					options,
				});

				assert.strictEqual(isActual, !tests.platform.isWindows());
				accept(FILE_ENTRY, {
					positive: ['**/*'],
					negative: ['//server/other/workspace/root/file.txt'],
					options,
				});
			});

			it('should preserve a device drive root on Windows', () => {
				const isActual = isAccepted(FILE_ENTRY, {
					positive: ['**/*'],
					negative: ['/root/file.txt'],
					options: { cwd: '//?/X:/', absolute: true },
				});

				assert.strictEqual(isActual, !tests.platform.isWindows());
			});

			it('should preserve escaped characters in the pattern', () => {
				const entry = tests.entry.builder().path('root/[file].txt').file().build();

				reject(entry, {
					positive: ['**/*'],
					negative: [String.raw`/root/\[file\].txt`],
					options: { cwd: root, absolute: true },
				});
			});

			it('should not normalize parent segments in the pattern', () => {
				accept(FILE_ENTRY, {
					positive: ['**/*'],
					negative: ['/root/missing/../file.txt'],
					options: { cwd: root, absolute: true },
				});
			});
		});

		describe('Pattern', () => {
			it('should reject when an entry match to the negative pattern', () => {
				reject(FILE_ENTRY, {
					positive: ['**/*'],
					negative: ['**/*'],
				});
			});

			it('should reject when an entry does not match to the positive pattern', () => {
				reject(FILE_ENTRY, {
					positive: ['*'],
				});
			});

			it('should accept when an entry match to the positive pattern with a leading dot', () => {
				accept(FILE_ENTRY, {
					positive: ['./**/*'],
				});
			});

			it('should accept an entry with a leading dot', () => {
				const entry = tests.entry.builder().path('./root/file.txt').file().build();

				accept(entry, {
					positive: ['**/*'],
				});
			});

			it('should accept when an entry match to the positive pattern', () => {
				accept(FILE_ENTRY, {
					positive: ['**/*'],
				});
			});

			it('should try to apply patterns to the path with the trailing slash for directory entry', () => {
				accept(DIRECTORY_ENTRY, {
					positive: ['**/'],
					options: { onlyFiles: false },
				});
			});

			it('should not try to apply patterns to the path with the trailing slash for non-directory entry', () => {
				reject(FILE_ENTRY, {
					positive: ['**/'],
					options: { onlyFiles: false },
				});
			});

			it('should reject a hidden entry by negative pattern even when the dot options is disabled', () => {
				const entry = tests.entry.builder().path('root/files/.hidden.txt').file().build();

				reject(entry, {
					positive: ['**/!(ignore)*.txt'],
					negative: ['**/files/**/*'],
					options: { dot: false },
				});
			});
		});
	});

	describe('Immutability', () => {
		it('should return the data without changes', () => {
			const filter = getFilter({
				positive: ['**/*'],
			});

			const reference = tests.entry.builder().path('root/file.txt').file().build();
			const entry = tests.entry.builder().path('root/file.txt').file().build();

			filter(entry);

			assert.deepStrictEqual(entry, reference);
		});
	});
});
