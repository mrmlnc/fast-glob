import * as fs from 'node:fs';

import type { FsStats, FsDirent } from '../types';

const _kStats = Symbol('stats');

type DirentStatsKeysIntersection = 'constructor' | keyof FsDirent & keyof FsStats;

// Adapting an internal class in Node.js to mimic the behavior of `fs.Dirent` when creating it manually from `fs.Stats`.
// https://github.com/nodejs/node/blob/a4cf6b204f0b160480153dc293ae748bf15225f9/lib/internal/fs/utils.js#L199C1-L213
export class DirentFromStats extends fs.Dirent {
	private readonly [_kStats]: FsStats;

	constructor(name: string, stats: FsStats) {
		// @ts-expect-error The constructor has parameters, but they are not represented in types.
		// https://github.com/nodejs/node/blob/a4cf6b204f0b160480153dc293ae748bf15225f9/lib/internal/fs/utils.js#L164
		super(name, null);

		this[_kStats] = stats;
	}
}

for (const key of Reflect.ownKeys(fs.Dirent.prototype)) {
	const name = key as 'constructor' | DirentStatsKeysIntersection;

	if (name === 'constructor') {
		continue;
	}

	DirentFromStats.prototype[name] = function () {
		return this[_kStats][name]();
	};
}

export function createDirentFromStats(name: string, stats: FsStats): FsDirent {
	return new DirentFromStats(name, stats);
}
