import { execa } from 'execa';
import { task } from 'hereby';

const CONCURRENCY = process.env.CONCURRENCY === '1';
const REPORTER = process.env.REPORTER ?? 'compact';
const WARMUP_COUNT = process.env.WARMUP_COUNT ?? 50;
const RUNS_COUNT = process.env.RUNS_COUNT ?? 100;

const PRODUCT_ASYNC_SUITE = './out/benchmark/suites/product/async.js';
const PRODUCT_SYNC_SUITE = './out/benchmark/suites/product/sync.js';
const PRODUCT_STREAM_SUITE = './out/benchmark/suites/product/stream.js';

const REGRESSION_ASYNC_SUITE = './out/benchmark/suites/regression/async.js';
const REGRESSION_SYNC_SUITE = './out/benchmark/suites/regression/sync.js';
const REGRESSION_STREAM_SUITE = './out/benchmark/suites/regression/stream.js';

const FLATTEN_PATTERN = '*';
const DEEP_PATTERN = '**';
const PARTIAL_FLATTEN_PATTERN = '{fixtures,out}/{first,second}/*';
const PARTIAL_DEEP_PATTERN = '{fixtures,out}/**';

async function benchTask(suite, label, pattern, implementations = []) {
	await execa('bencho', [
		`'node ${suite} . "${pattern}" {impl}'`,
		`-n "${label} {impl} ${pattern}"`,
		`-w ${WARMUP_COUNT}`,
		`-r ${RUNS_COUNT}`,
		`-l impl=${implementations.join()}`,
		`--reporter=${REPORTER}`
	], {
		shell: true,
		stdout: 'inherit'
	});
}

function makeBenchSuiteTask(type, label, suite, implementations = []) {
	const asyncFlattenTask = task({
		name: `bench:${type}:${label}:flatten`,
		run: () => benchTask(suite, label, FLATTEN_PATTERN, implementations)
	});

	const asyncDeepTask = task({
		name: `bench:${type}:${label}:deep`,
		dependencies: CONCURRENCY ? [] : [asyncFlattenTask],
		run: () => benchTask(suite, label, DEEP_PATTERN, implementations)
	});

	const asyncPartialFlattenTask = task({
		name: `bench:${type}:${label}:partial_flatten`,
		dependencies: CONCURRENCY ? [] : [asyncDeepTask],
		run: () => benchTask(suite, label, PARTIAL_FLATTEN_PATTERN, implementations)
	});

	const asyncPartialDeepTask = task({
		name: `bench:${type}:${label}:partial_deep`,
		dependencies: CONCURRENCY ? [] : [asyncPartialFlattenTask],
		run: () => benchTask(suite, label, PARTIAL_DEEP_PATTERN, implementations)
	});

	return task({
		name: `bench:${type}:${label}`,
		dependencies: CONCURRENCY ? [] : [asyncPartialDeepTask],
		run: () => {}
	});
}

export const {
	productAsyncTask,
	productStreamTask,
	productSyncTask
} = {
	productAsyncTask: makeBenchSuiteTask('product', 'async', PRODUCT_ASYNC_SUITE, ['fast-glob', 'node-glob', 'fdir']),
	productStreamTask: makeBenchSuiteTask('product', 'stream', PRODUCT_STREAM_SUITE, ['fast-glob', 'node-glob']),
	productSyncTask: makeBenchSuiteTask('product', 'sync', PRODUCT_SYNC_SUITE, ['fast-glob', 'node-glob', 'fdir'])
};

export const {
	regressionAsyncTask,
	regressionStreamTask,
	regressionSyncTask
} = {
	regressionAsyncTask: makeBenchSuiteTask('regression', 'async', REGRESSION_ASYNC_SUITE, ['current', 'previous']),
	regressionStreamTask: makeBenchSuiteTask('regression', 'stream', REGRESSION_STREAM_SUITE, ['current', 'previous']),
	regressionSyncTask: makeBenchSuiteTask('regression', 'sync', REGRESSION_SYNC_SUITE, ['current', 'previous'])
};
