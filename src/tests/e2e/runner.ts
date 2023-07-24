import * as assert from 'assert';

import * as snapshotIt from 'snap-shot-it';

import * as fg from '../..';

import type { Pattern } from '../../types';

const CWD = process.cwd().replace(/\\/g, '/');

type TransformFunction = (entry: string) => string;

interface Suite {
	tests: Test[] | Test[][];
	/**
	 * Allow to run only one test case with debug information.
	 */
	debug?: fg.Options | boolean;
	/**
	 * The ability to conditionally run the test.
	 */
	condition?: () => boolean;
	resultTransform?: TransformFunction;
}

interface Test {
	pattern: Pattern | Pattern[];
	options?: fg.Options;
	/**
	 * Allow to run only one test case with debug information.
	 */
	debug?: fg.Options | boolean;
	/**
	 * The ability to conditionally run the test.
	 */
	condition?: () => boolean;
	resultTransform?: TransformFunction;
	/**
	 * The issue related to this test.
	 */
	issue?: number[] | number;
	expected?: () => string[];
}

type MochaDefinition = Mocha.ExclusiveTestFunction | Mocha.TestFunction;

export function suite(name: string, suite: Suite): void {
	describe(name, () => {
		for (const test of getSuiteTests(suite.tests)) {
			const title = getTestTitle(test);
			const definition = getTestMochaDefinition(suite, test);
			const transformers = getResultTransformers(suite, test);
			const patterns = getTestPatterns(test);
			const options = getFastGlobOptions(suite, test);

			definition(`${title} (sync)`, () => {
				let actual = getFastGlobEntriesSync(patterns, options);

				actual = transform(actual, transformers);

				debug(actual, suite, test);
				assertResult(actual, test);
			});

			definition(`${title} (async)`, async () => {
				let actual = await getFastGlobEntriesAsync(patterns, options);

				actual = transform(actual, transformers);

				debug(actual, suite, test);
				assertResult(actual, test);
			});

			definition(`${title} (stream)`, async () => {
				let actual = await getFastGlobEntriesStream(patterns, options);

				actual = transform(actual, transformers);

				debug(actual, suite, test);
				assertResult(actual, test);
			});
		}
	});
}

function getSuiteTests(tests: Test[] | Test[][]): Test[] {
	return ([] as Test[]).concat(...tests);
}

function getTestPatterns(test: Test): Pattern[] {
	return ([] as Pattern[]).concat(test.pattern);
}

function getTestTitle(test: Test): string {
	// Replacing placeholders to hide absolute paths from snapshots.
	const replacements = {
		cwd: test.options?.cwd?.replace(CWD, '<root>'),
		ignore: test.options?.ignore?.map((pattern) => pattern.replace(CWD, '<root>')),
	};

	return JSON.stringify({
		pattern: test.pattern,
		options: {
			...test.options,
			...replacements,
		},
	});
}

function getTestMochaDefinition(suite: Suite, test: Test): MochaDefinition {
	const isDebugDefined = suite.debug !== undefined || test.debug !== undefined;
	const isDebugEnabled = suite.debug !== false || test.debug !== false;

	if (isDebugDefined && isDebugEnabled) {
		return it.only;
	}

	if (suite.condition?.() === false || test.condition?.() === false) {
		return it.skip;
	}

	return it;
}

function getFastGlobOptions(suite: Suite, test: Test): fg.Options | undefined {
	let options = test.options;

	if (typeof suite.debug !== 'boolean') {
		options = { ...options, ...suite.debug };
	}

	if (typeof test.debug !== 'boolean') {
		options = { ...options, ...test.debug };
	}

	return options;
}

function getResultTransformers(suite: Suite, test: Test): TransformFunction[] {
	const transformers: TransformFunction[] = [];

	if (suite.resultTransform !== undefined) {
		transformers.push(suite.resultTransform);
	}

	if (test.resultTransform !== undefined) {
		transformers.push(test.resultTransform);
	}

	return transformers;
}

function getFastGlobEntriesSync(patterns: Pattern[], options?: fg.Options): string[] {
	return fg.sync(patterns, options);
}

async function getFastGlobEntriesAsync(patterns: Pattern[], options?: fg.Options): Promise<string[]> {
	return fg(patterns, options);
}

async function getFastGlobEntriesStream(patterns: Pattern[], options?: fg.Options): Promise<string[]> {
	const stream = fg.stream(patterns, options);

	const entries: string[] = [];

	for await (const entry of stream) {
		entries.push(entry as string);
	}

	return entries;
}

function transform(entries: string[], transformers: TransformFunction[]): string[] {
	let result = entries;

	for (const transformer of transformers) {
		result = result.map((item) => transformer(item));
	}

	return result;
}

function assertResult(entries: string[], test: Test): void {
	entries.sort((a, b) => a.localeCompare(b));

	if (test.expected === undefined) {
		snapshotIt(entries);
	} else {
		const expected = test.expected();

		expected.sort((a, b) => a.localeCompare(b));

		assert.deepStrictEqual(entries, expected);
	}
}

function debug(current: string[], suite: Suite, test: Test): void {
	const isDebug = suite.debug !== undefined || test.debug !== undefined;

	if (isDebug) {
		console.dir({
			current,
			suite: { debug: suite.debug },
			test: { debug: test.debug, options: test.options },
		}, { colors: true });
	}
}
