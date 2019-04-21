import * as assert from 'assert';

import Table = require('easy-table');
import glob = require('glob');

import * as fg from '../../index';
import { Options } from '../../settings';
import { Pattern } from '../../types/patterns';

export interface ISmokeTest {
	pattern: Pattern;
	ignore?: Pattern;
	cwd?: string;
	globOptions?: glob.IOptions;
	fgOptions?: Options<string>;
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
}

type MochaDefinition = (desc: string, cb: (this: Mocha.Context) => void) => void;
type DebugCompareTestMarker = '+' | '-';

/**
 * Runs the passed test suite.
 */
export function suite(name: string, tests: Array<ISmokeTest | ISmokeTest[]>): void {
	const testCases = getTestCases(tests);

	describe(name, () => {
		for (const test of testCases) {
			const title = getTestCaseTitle(test);
			const definition = getTestCaseMochaDefinition(test);

			definition(title, () => testCaseRunner(test));
		}
	});
}

/**
 * Return flatten list of test cases.
 */
function getTestCases(tests: Array<ISmokeTest | ISmokeTest[]>): ISmokeTest[] {
	return ([] as ISmokeTest[]).concat(...tests);
}

/**
 * Return title for one of test cases.
 */
function getTestCaseTitle(test: ISmokeTest): string {
	let title = `pattern: '${test.pattern}'`;

	if (test.ignore) {
		title += `, ignore: '${test.ignore}'`;
	}
	if (test.broken) {
		title += ` (broken - ${test.issue})`;
	}
	if (test.correct) {
		title += ' (correct)';
	}

	return title;
}

/**
 * Return test case definition for run.
 */
function getTestCaseMochaDefinition(test: ISmokeTest): MochaDefinition {
	return test.debug ? it.only : it;
}

/**
 * Runs one of the passed test cases.
 */
function testCaseRunner(test: ISmokeTest): void {
	const expected = getNodeGlobEntries(test.pattern, test.ignore, test.cwd, test.globOptions);
	const actual = getFastGlobEntries(test.pattern, test.ignore, test.cwd, test.fgOptions);

	if (test.debug) {
		const report = generateDebugReport(expected, actual);

		console.log(report);
	}

	if (test.broken && !test.issue) {
		assert.fail("This test is marked as «broken», but it doesn't have a issue key.");
	}

	if (test.correct && !test.reason) {
		assert.fail("This test is marked as «correct», but it doesn't have a reason.");
	}

	const assertAction = (test.broken || test.correct) ? assert.notDeepStrictEqual : assert.deepStrictEqual;

	assertAction(actual, expected);
}

/**
 * Generate debug information for the current run.
 */
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

/**
 * Return marker for test.
 */
function getTestMarker(items: string[], item: string): DebugCompareTestMarker {
	return items.indexOf(item) !== -1 ? '+' : '-';
}

/**
 * Return entries from the `node-glob` package with sorting.
 */
function getNodeGlobEntries(pattern: Pattern, ignore?: Pattern, cwd?: string, opts?: glob.IOptions): string[] {
	const options: glob.IOptions = {
		cwd: cwd || process.cwd(),
		ignore: ignore ? [ignore] : [],
		...opts
	};

	return glob.sync(pattern, options).sort();
}

/**
 * Return entries from the `fast-glob` package with sorting.
 */
function getFastGlobEntries(pattern: Pattern, ignore?: Pattern, cwd?: string, opts?: Options<string>): string[] {
	const options: Options<string> = {
		cwd: cwd || process.cwd(),
		ignore: ignore ? [ignore] : [],
		onlyFiles: false,
		...opts
	};

	return fg.sync(pattern, options).sort() as string[];
}
