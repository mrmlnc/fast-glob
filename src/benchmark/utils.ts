import { SuiteMeasures } from './runner';

import stdev = require('compute-stdev'); // eslint-disable-line @typescript-eslint/no-require-imports

const NANOSECONDS_IN_SECOND = 1e9;
const MICROSECONDS_IN_SECOND = 1e6;
const BYTES_IN_MEGABYTE = 1e6;

export function convertHrtimeToMilliseconds(hrtime: [number, number]): number {
	const nanoseconds = hrtime[0] * NANOSECONDS_IN_SECOND;

	return (nanoseconds + hrtime[1]) / MICROSECONDS_IN_SECOND;
}

export function convertBytesToMegaBytes(bytes: number): number {
	return bytes / MICROSECONDS_IN_SECOND;
}

export function timeStart(): [number, number] {
	return process.hrtime();
}

export function timeEnd(start: [number, number]): number {
	const hrtime = process.hrtime(start);

	return convertHrtimeToMilliseconds(hrtime);
}

export function getMemory(): number {
	return process.memoryUsage().heapUsed / BYTES_IN_MEGABYTE;
}

export function formatMeasures(matches: number, time: number, memory: number): string {
	const measures: SuiteMeasures = { matches, time, memory };

	return JSON.stringify(measures);
}

export function getAverageValue(values: number[]): number {
	return values.reduce((a, b) => a + b, 0) / values.length;
}

export function getStdev(values: number[]): number {
	return stdev(values);
}

export function getEnvironmentAsString(name: string, value: string): string {
	const environment = process.env[name];

	return environment === undefined ? value : environment;
}

export function getEnvironmentAsInteger(name: string, value: number): number {
	const environment = process.env[name];

	return environment === undefined ? value : parseInt(environment, 10);
}

export function getEnvironmentAsObject(name: string, value: object): object {
	const environment = process.env[name];

	return environment === undefined ? value : JSON.parse(environment) as object;
}
