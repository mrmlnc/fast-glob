import * as fsUtils from '../utils/fs';
import * as smoke from './smoke';

/**
 * Here we expect only directories.
 * Also we skip the root directory due to ISSUE-47.
 */
function globFilter(entry: string, filepath: string): boolean {
	const isRootEntry = entry === 'fixtures' || entry === 'fixtures/';

	return fsUtils.isDirectory(filepath) && !isRootEntry;
}

/**
 * The 'glob' package automatically adds a trailing slash when the pattern ends with it.
 * We do not support this behavior and do not want to support it in the future because it is implicit behavior.
 * We need real use cases if someone needs it.
 */
function globTransform(entry: string): string {
	return entry.endsWith('/') ? entry.slice(0, -1) : entry;
}

smoke.suite('Smoke → Directories', [
	{
		pattern: 'fixtures/*',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	},
	{
		pattern: 'fixtures/**',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	},
	{
		pattern: 'fixtures/**/*',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	},
	{
		pattern: 'fixtures/*/',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	},
	{
		pattern: 'fixtures/**/',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	},
	{
		pattern: 'fixtures/**/*/',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	}
]);

smoke.suite('Smoke → Directories (cwd)', [
	{
		pattern: '*',
		cwd: 'fixtures',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	},
	{
		pattern: '**',
		cwd: 'fixtures',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	},
	{
		pattern: '**/*',
		cwd: 'fixtures',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	},
	{
		pattern: '*/',
		cwd: 'fixtures',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	},
	{
		pattern: '**/',
		cwd: 'fixtures',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	},
	{
		pattern: '**/*/',
		cwd: 'fixtures',
		fgOptions: { onlyDirectories: true },
		globFilter,
		globTransform
	}
]);
