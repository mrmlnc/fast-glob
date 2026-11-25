import * as fs from 'node:fs';
import * as path from 'node:path';
import type { FsStats, FsDirent } from '../types/index.js';

const direntConstants = fs.constants as unknown as Record<string, number>;

function direntType(stats: FsStats): number {
	if (stats.isFile()) return direntConstants["UV_DIRENT_FILE"];
	if (stats.isDirectory()) return direntConstants["UV_DIRENT_DIR"];
	if (stats.isSymbolicLink()) return direntConstants["UV_DIRENT_LINK"];
	if (stats.isFIFO()) return direntConstants["UV_DIRENT_FIFO"];
	if (stats.isSocket()) return direntConstants["UV_DIRENT_SOCKET"];
	if (stats.isCharacterDevice()) return direntConstants["UV_DIRENT_CHAR"];
	if (stats.isBlockDevice()) return direntConstants["UV_DIRENT_BLOCK"];
	return direntConstants["UV_DIRENT_UNKNOWN"];
}

export function createDirentFromStats(filepath: string, stats: FsStats): FsDirent {
	// @ts-expect-error The constructor has parameters, but they are not represented in types.
	return new fs.Dirent(path.basename(filepath), direntType(stats), path.dirname(filepath));
}
