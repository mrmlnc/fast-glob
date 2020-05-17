import * as assert from 'assert';

import * as glob from 'glob';

import * as fg from '../..';
import { Options } from '../../settings';
import { Pattern } from '../../types';

import Table = require('easy-table'); // eslint-disable-line @typescript-eslint/no-require-imports

export type SmokeTest = {
	pattern: Pattern;
	ignore?: Pattern;
	cwd?: string;
	globOptions?: glob.IOptions;
	fgOptions?: Options;
	/**
	 * Allow to run only one test case with debug information.
	 */
	debug?: boolean;
	/**
	 * Mark test case as broken. This is requires a issue to repair.
	 */
	broken?: boolean;
	issue?: number | number[];
	/**
	 * Mark test case as correct. This is requires a reason why is true.
	 */
	correct?: boolean;
	reason?: string;
};

type MochaDefinition = Mocha.TestFunction | Mocha.ExclusiveTestFunction;
type DebugCompareTestMarker = '+' | '-';

export function suite(name: string, tests: Array<SmokeTest | SmokeTest[]>): void {
	const testCases = getTestCases(tests);

	describe(name, () => {
		for (const test of testCases) {
			const title = getTestCaseTitle(test);
			const definition = getTestCaseMochaDefinition(test);

			definition(`${title} (sync)`, () => testCaseRunner(test, getFastGlobEntriesSync));
			definition(`${title} (async)`, () => testCaseRunner(test, getFastGlobEntriesAsync));
			definition(`${title} (stream)`, () => testCaseRunner(test, getFastGlobEntriesStream));
		}
	});
}

function getTestCases(tests: Array<SmokeTest | SmokeTest[]>): SmokeTest[] {
	return ([] as SmokeTest[]).concat(...tests);
}

function getTestCaseTitle(test: SmokeTest): string {
	let title = `pattern: '${test.pattern}'`;

	if (test.ignore !== undefined) {
		title += `, ignore: '${test.ignore}'`;
	}

	if (test.broken !== undefined) {
		title += ` (broken - ${test.issue})`;
	}

	if (test.correct !== undefined) {
		title += ' (correct)';
	}

	return title;
}

function getTestCaseMochaDefinition(test: SmokeTest): MochaDefinition {
	return test.debug === true ? it.only : it;
}

async function testCaseRunner(test: SmokeTest, func: typeof getFastGlobEntriesSync | typeof getFastGlobEntriesAsync): Promise<void> {
	const expected = getNodeGlobEntries(test.pattern, test.ignore, test.cwd, test.globOptions);
	const actual = await func(test.pattern, test.ignore, test.cwd, test.fgOptions);

	if (test.debug === true) {
		const report = generateDebugReport(expected, actual);

		console.log(report);
	}

	if (test.broken === true && test.issue === undefined) {
		assert.fail("This test is marked as «broken», but it doesn't have a issue key.");
	}

	if (test.correct === true && test.reason === undefined) {
		assert.fail("This test is marked as «correct», but it doesn't have a reason.");
	}

	const isInvertedTest = test.broken === true || test.correct === true;
	const assertAction: typeof assert.deepStrictEqual = isInvertedTest ? assert.notDeepStrictEqual : assert.deepStrictEqual;

	assertAction(actual, expected);
}

function generateDebugReport(expected: string[], actual: string[]): string | null {
	const table = new Table();

	const items = actual.length > expected.length ? actual : expected;

	if (items.length === 0) {
		return null;
	}

	for (const item of items) {
		table.cell('FIXTURES', item);
		table.cell('NODE_GLOB', getTestMarker(expected, item));
		table.cell('FAST_GLOB', getTestMarker(actual, item));
		table.newRow();
	}

	return table.toString();
}

function getTestMarker(items: string[], item: string): DebugCompareTestMarker {
	return items.includes(item) ? '+' : '-';
}

function getNodeGlobEntries(pattern: Pattern, ignore?: Pattern, cwd?: string, options?: glob.IOptions): string[] {
	const entries = glob.sync(pattern, {
		cwd: cwd === undefined ? process.cwd() : cwd,
		ignore: ignore === undefined ? [] : [ignore],
		...options
	});

	entries.sort((a, b) => a.localeCompare(b));

	return entries;
}

function getFastGlobEntriesSync(pattern: Pattern, ignore?: Pattern, cwd?: string, options?: Options): string[] {
	return fg.sync(pattern, getFastGlobOptions(ignore, cwd, options)).sort((a, b) => a.localeCompare(b));
}

function getFastGlobEntriesAsync(pattern: Pattern, ignore?: Pattern, cwd?: string, options?: Options): Promise<string[]> {
	return fg(pattern, getFastGlobOptions(ignore, cwd, options)).then((entries) => {
		entries.sort((a, b) => a.localeCompare(b));

		return entries;
	});
}

function getFastGlobEntriesStream(pattern: Pattern, ignore?: Pattern, cwd?: string, options?: Options): Promise<string[]> {
	const entries: string[] = [];

	const stream = fg.stream(pattern, getFastGlobOptions(ignore, cwd, options));

	return new Promise((resolve, reject) => {
		stream.on('data', (entry: string) => entries.push(entry));
		stream.once('error', reject);
		stream.once('end', () => {
			entries.sort((a, b) => a.localeCompare(b));

			resolve(entries);
		});
	});
}

function getFastGlobOptions(ignore?: Pattern, cwd?: string, options?: Options): Options {
	return {
		cwd: cwd === undefined ? process.cwd() : cwd,
		ignore: ignore === undefined ? [] : [ignore],
		onlyFiles: false,
		...options
	};
}
