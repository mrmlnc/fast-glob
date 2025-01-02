import { performance } from 'node:perf_hooks';

import * as bencho from 'bencho';

import type * as currentVersion from '../index.js';
import type * as previousVersion from 'fast-glob';
import type * as glob from 'glob';
import type * as tg from 'tinyglobby';

export function timeStart(): number {
	return performance.now();
}

export function timeEnd(start: number): number {
	return performance.now() - start;
}

export function getMemory(): number {
	return process.memoryUsage().heapUsed;
}

export function importCurrentFastGlob(): Promise<typeof currentVersion> {
	return import('../index.js');
}

export function importPreviousFastGlob(): Promise<typeof previousVersion> {
	return import('fast-glob');
}

export function importNodeGlob(): Promise<typeof glob> {
	return import('glob');
}

export function importTinyGlobby(): Promise<typeof tg> {
	return import('tinyglobby');
}

export async function importAndMeasure<T>(function_: () => Promise<T>): Promise<T> {
	const start = timeStart();

	const result = await function_();

	const time = timeEnd(start);

	bencho.time('import.time', time);

	return result;
}
