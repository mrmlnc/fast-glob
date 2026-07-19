import * as assert from 'node:assert';
import * as process from 'node:process';
import snapshotIt from 'snap-shot-it';
import { describe, it } from 'mocha';
import * as fg from '../..';
import type { Pattern } from '../../types';

const CWD = process.cwd().replaceAll('\\', '/');

type TransformFunction = (entry: string) => string;

type Suite = {
	tests: Test[] | Test[][];
	/**
	 * Allow to run only one test case with debug information.
	 */
	debug?: boolean | fg.Options;
	/**
	 * The ability to conditionally run the test.
	 */
	condition?: () => boolean;
	resultTransform?: TransformFunction;
};

type Test = {
	pattern: Pattern | Pattern[];
	options?: fg.Options;
	/**
	 * Allow to run only one test case with debug information.
	 */
	debug?: boolean | fg.Options;
	/**
	 * The ability to conditionally run the test.
	 */
	condition?: () => boolean;
	resultTransform?: TransformFunction;
	/**
	 * The issue related to this test.
	 */
	issue?: number | number[];
	expected?: () => string[];
};

type MochaDefinition = Mocha.ExclusiveTestFunction | Mocha.TestFunction;

export function suite(name: string, suiteOptions: Suite): void {
	describe(name, () => {
		for (const test of getSuiteTests(suiteOptions.tests)) {
			const title = getTestTitle(test);
			const definition = getTestMochaDefinition(suiteOptions, test);
			const transformers = getResultTransformers(suiteOptions, test);
			const patterns = getTestPatterns(test);
			const options = getFastGlobOptions(suiteOptions, test);

			definition(`${title} (sync)`, () => {
				let actual = getFastGlobEntriesSync(patterns, options);

				actual = transform(actual, transformers);

				debug(actual, suiteOptions, test);
				assertResult(actual, test);
			});

			definition(`${title} (async)`, async () => {
				let actual = await getFastGlobEntriesAsync(patterns, options);

				actual = transform(actual, transformers);

				debug(actual, suiteOptions, test);
				assertResult(actual, test);
			});

			definition(`${title} (stream)`, async () => {
				let actual = await getFastGlobEntriesStream(patterns, options);

				actual = transform(actual, transformers);

				debug(actual, suiteOptions, test);
				assertResult(actual, test);
			});
		}
	});
}

function getSuiteTests(tests: Test[] | Test[][]): Test[] {
	return tests.flat();
}

function getTestPatterns(test: Test): Pattern[] {
	return Array.isArray(test.pattern) ? test.pattern : [test.pattern];
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

function getTestMochaDefinition(suiteOptions: Suite, test: Test): MochaDefinition {
	const isDebugDefined = suiteOptions.debug !== undefined || test.debug !== undefined;
	const isDebugEnabled = suiteOptions.debug !== false || test.debug !== false;

	if (isDebugDefined && isDebugEnabled) {
		return it.only;
	}

	if (suiteOptions.condition?.() === false || test.condition?.() === false) {
		return it.skip;
	}

	return it;
}

function getFastGlobOptions(suiteOptions: Suite, test: Test): fg.Options | undefined {
	let { options } = test;

	if (typeof suiteOptions.debug !== 'boolean') {
		options = { ...options, ...suiteOptions.debug };
	}

	if (typeof test.debug !== 'boolean') {
		options = { ...options, ...test.debug };
	}

	return options;
}

function getResultTransformers(suiteOptions: Suite, test: Test): TransformFunction[] {
	const transformers: TransformFunction[] = [];

	if (suiteOptions.resultTransform !== undefined) {
		transformers.push(suiteOptions.resultTransform);
	}

	if (test.resultTransform !== undefined) {
		transformers.push(test.resultTransform);
	}

	return transformers;
}

function getFastGlobEntriesSync(patterns: Pattern[], options?: fg.Options): string[] {
	return fg.globSync(patterns, options);
}

async function getFastGlobEntriesAsync(patterns: Pattern[], options?: fg.Options): Promise<string[]> {
	return fg.glob(patterns, options);
}

async function getFastGlobEntriesStream(patterns: Pattern[], options?: fg.Options): Promise<string[]> {
	const entries: string[] = [];

	const stream = fg.globStream(patterns, options);

	await new Promise((resolve, reject) => {
		stream.on('data', (entry: string) => {
			entries.push(entry);
		});
		stream.once('error', reject);
		stream.once('end', resolve);
	});

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

function debug(current: string[], suiteOptions: Suite, test: Test): void {
	const isDebug = suiteOptions.debug !== undefined || test.debug !== undefined;

	if (isDebug) {
		console.dir({
			current,
			suite: { debug: suiteOptions.debug },
			test: { debug: test.debug, options: test.options },
		}, { colors: true });
	}
}
