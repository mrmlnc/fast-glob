import { performance } from 'node:perf_hooks';

import * as bencho from 'bencho';

import type * as fs from 'node:fs';
import type * as currentVersion from '..';
import type * as previousVersion from 'fast-glob';
import type * as glob from 'glob';
import type * as tg from 'tinyglobby';

type NativeGlobAsynchronous = (pattern: string, options: {
	cwd: string;
	withFileTypes: boolean;
}) => Promise<AsyncIterable<fs.Dirent>>;

type NativeGlobSynchronous = (pattern: string, options: {
	cwd: string;
	withFileTypes: boolean;
}) => fs.Dirent[];

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
	return import('..');
}

export async function importNativeGlob(): Promise<{
	glob: NativeGlobAsynchronous;
	globSync: NativeGlobSynchronous;
}> {
	const fs = await import('node:fs');

	return {
		// @ts-expect-error The current version of @types/node has not definitions for this method.
		glob: fs.promises.glob as NativeGlobAsynchronous,
		// @ts-expect-error The current version of @types/node has not definitions for this method.
		globSync: fs.globSync as NativeGlobSynchronous,
	};
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
