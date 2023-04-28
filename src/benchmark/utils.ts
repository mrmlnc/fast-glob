import { performance } from 'perf_hooks';

import * as bencho from 'bencho';

export function timeStart(): number {
	return performance.now();
}

export function timeEnd(start: number): number {
	return performance.now() - start;
}

export function getMemory(): number {
	return process.memoryUsage().heapUsed;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export function importCurrentFastGlob(): Promise<typeof import('..')> {
	return import('..');
}

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export function importPreviousFastGlob(): Promise<typeof import('fast-glob')> {
	return import('fast-glob');
}

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export function importNodeGlob(): Promise<typeof import('glob')> {
	return import('glob');
}

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export function importFdir(): Promise<typeof import('fdir')> {
	return import('fdir');
}

export async function importAndMeasure<T>(func: () => Promise<T>): Promise<T> {
	const start = timeStart();

	const result = await func();

	const time = timeEnd(start);

	bencho.time('import.time', time);

	return result;
}
