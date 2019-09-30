import * as assert from 'assert';

import * as fg from '../../index';
import { Options } from '../../settings';
import { Pattern } from '../../types/index';

import Table = require('easy-table');
import glob = require('glob');

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

type MochaDefinition = (desc: string, cb: (this: Mocha.Context) => void) => void;
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

function getTestCaseMochaDefinition(test: SmokeTest): MochaDefinition {
	return test.debug ? it.only : it;
}

async function testCaseRunner(test: SmokeTest, func: typeof getFastGlobEntriesSync | typeof getFastGlobEntriesAsync): Promise<void> {
	const expected = getNodeGlobEntries(test.pattern, test.ignore, test.cwd, test.globOptions);
	const actual = await func(test.pattern, test.ignore, test.cwd, test.fgOptions);

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

	const isInvertedTest = test.broken || test.correct;
	const assertAction = isInvertedTest ? assert.notDeepStrictEqual : assert.deepStrictEqual;

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

function getNodeGlobEntries(pattern: Pattern, ignore?: Pattern, cwd?: string, opts?: glob.IOptions): string[] {
	const options: glob.IOptions = {
		cwd: cwd || process.cwd(),
		ignore: ignore ? [ignore] : [],
		...opts
	};

	return glob.sync(pattern, options).sort((a, b) => a.localeCompare(b));
}

function getFastGlobEntriesSync(pattern: Pattern, ignore?: Pattern, cwd?: string, opts?: Options): string[] {
	return fg.sync(pattern, getFastGlobOptions(ignore, cwd, opts)).sort((a, b) => a.localeCompare(b));
}

function getFastGlobEntriesAsync(pattern: Pattern, ignore?: Pattern, cwd?: string, opts?: Options): Promise<string[]> {
	return fg(pattern, getFastGlobOptions(ignore, cwd, opts)).then((entries) => {
		entries.sort((a, b) => a.localeCompare(b));

		return entries;
	});
}

function getFastGlobEntriesStream(pattern: Pattern, ignore?: Pattern, cwd?: string, opts?: Options): Promise<string[]> {
	const entries: string[] = [];

	const stream = fg.stream(pattern, getFastGlobOptions(ignore, cwd, opts));

	return new Promise((resolve, reject) => {
		stream.on('data', (entry: string) => entries.push(entry));
		stream.once('error', reject);
		stream.once('end', () => {
			entries.sort((a, b) => a.localeCompare(b));

			resolve(entries);
		});
	});
}

function getFastGlobOptions(ignore?: Pattern, cwd?: string, opts?: Options): Options {
	return {
		cwd: cwd || process.cwd(),
		ignore: ignore ? [ignore] : [],
		onlyFiles: false,
		...opts
	};
}
