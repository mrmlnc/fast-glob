import { performance } from 'node:perf_hooks';
import * as process from 'node:process';
import type * as fs from 'node:fs';
import * as bencho from 'bencho';
import type previousVersion from 'fast-glob';
import type * as glob from 'glob';
import type * as tg from 'tinyglobby';
import type * as currentVersion from '../index.js';

export function timeStart(): number {
	return performance.now();
}

export function timeEnd(start: number): number {
	return performance.now() - start;
}

export function getMemory(): number {
	return process.memoryUsage().heapUsed;
}

export async function importCurrentFastGlob(): Promise<typeof currentVersion> {
	return import('../index.js');
}

export async function importPreviousFastGlob(): Promise<typeof previousVersion> {
	const { default: previousFastGlob } = await import('fast-glob');

	return previousFastGlob;
}

export async function importNodeGlob(): Promise<typeof glob> {
	return import('glob');
}

export async function importNodeFsGlob(): Promise<typeof fs> {
	return import('node:fs');
}

export async function importTinyGlobby(): Promise<typeof tg> {
	return import('tinyglobby');
}

export async function importAndMeasure<T>(function_: () => Promise<T>): Promise<T> {
	const start = timeStart();

	const result = await function_();

	const time = timeEnd(start);

	bencho.time('import.time', time);

	return result;
}
