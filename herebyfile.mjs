import process from 'node:process';
import { execa } from 'execa';
import { task } from 'hereby';

const IS_CONCURRENCY = process.env.CONCURRENCY === '1';
const REPORTER = process.env.REPORTER ?? 'compact';
const WARMUP_COUNT = process.env.WARMUP_COUNT ?? 100;
const RUNS_COUNT = process.env.RUNS_COUNT ?? 300;

const PRODUCT_ASYNC_SUITE = './out/benchmark/suites/product/async.js';
const PRODUCT_SYNC_SUITE = './out/benchmark/suites/product/sync.js';
const PRODUCT_STREAM_SUITE = './out/benchmark/suites/product/stream.js';

const REGRESSION_ASYNC_SUITE = './out/benchmark/suites/regression/async.js';
const REGRESSION_SYNC_SUITE = './out/benchmark/suites/regression/sync.js';
const REGRESSION_STREAM_SUITE = './out/benchmark/suites/regression/stream.js';

const OVERHEAD_ASYNC_SUITE = './out/benchmark/suites/overhead/async.js';
const OVERHEAD_SYNC_SUITE = './out/benchmark/suites/overhead/sync.js';
const OVERHEAD_STREAM_SUITE = './out/benchmark/suites/overhead/stream.js';

const FLATTEN_PATTERN = '*';
const DEEP_PATTERN = '**';
const PARTIAL_FLATTEN_PATTERN = '{fixtures,out}/{first,second}/*';
const PARTIAL_DEEP_PATTERN = '{fixtures,out}/**';
const EXTENSION_FLATTEN_PATTERN = '*.json';
const EXTENSION_DEEP_PATTERN = '**/*.js';
const BENCHO_IMPLEMENTATION_PLACEHOLDER = '{impl}';

async function benchTask({ suite, label, pattern, implementations = [], cwd = '.' }) {
	await execa('bencho', [
		`'node ${suite} "${cwd}" "${pattern}" ${BENCHO_IMPLEMENTATION_PLACEHOLDER}'`,
		`-n "${label} ${BENCHO_IMPLEMENTATION_PLACEHOLDER} ${pattern}"`,
		`-w ${WARMUP_COUNT}`,
		`-r ${RUNS_COUNT}`,
		`-l impl=${implementations.join(',')}`,
		`--reporter=${REPORTER}`,
	], {
		shell: true,
		stdout: 'inherit',
	});
}

function makeBenchSuiteTask({ type, label, suite, implementations = [], shouldIncludePartialTasks = true }) {
	const asyncFlattenTask = task({
		name: `bench:${type}:${label}:flatten`,
		run: () => benchTask({
			suite, label, pattern: FLATTEN_PATTERN, implementations,
		}),
	});

	const asyncExtensionFlattenTask = shouldIncludePartialTasks && task({
		name: `bench:${type}:${label}:extension_flatten`,
		dependencies: IS_CONCURRENCY ? [] : [asyncFlattenTask],
		run: () => benchTask({
			suite, label, pattern: EXTENSION_FLATTEN_PATTERN, implementations,
		}),
	});

	const asyncDeepTask = task({
		name: `bench:${type}:${label}:deep`,
		dependencies: IS_CONCURRENCY ? [] : [shouldIncludePartialTasks ? asyncExtensionFlattenTask : asyncFlattenTask],
		run: () => benchTask({
			suite, label, pattern: DEEP_PATTERN, implementations,
		}),
	});

	const asyncExtensionDeepTask = shouldIncludePartialTasks && task({
		name: `bench:${type}:${label}:extension_deep`,
		dependencies: IS_CONCURRENCY ? [] : [asyncDeepTask],
		run: () => benchTask({
			suite, label, pattern: EXTENSION_DEEP_PATTERN, implementations,
		}),
	});

	const asyncPartialFlattenTask = shouldIncludePartialTasks && task({
		name: `bench:${type}:${label}:partial_flatten`,
		dependencies: IS_CONCURRENCY ? [] : [asyncExtensionDeepTask],
		run: () => benchTask({
			suite, label, pattern: PARTIAL_FLATTEN_PATTERN, implementations,
		}),
	});

	const asyncPartialDeepTask = shouldIncludePartialTasks && task({
		name: `bench:${type}:${label}:partial_deep`,
		dependencies: IS_CONCURRENCY ? [] : [asyncPartialFlattenTask],
		run: () => benchTask({
			suite, label, pattern: PARTIAL_DEEP_PATTERN, implementations,
		}),
	});

	return task({
		name: `bench:${type}:${label}`,
		dependencies: IS_CONCURRENCY ? [] : [shouldIncludePartialTasks ? asyncPartialDeepTask : asyncDeepTask],
		run() {},
	});
}

export const {
	productAsyncTask,
	productStreamTask,
	productSyncTask,
} = {
	productAsyncTask: makeBenchSuiteTask({
		type: 'product', label: 'async', suite: PRODUCT_ASYNC_SUITE, implementations: ['fast-glob', 'tinyglobby', 'node-fs-glob', 'node-glob'],
	}),
	productStreamTask: makeBenchSuiteTask({
		type: 'product', label: 'stream', suite: PRODUCT_STREAM_SUITE, implementations: ['fast-glob', 'node-fs-glob', 'node-glob'],
	}),
	productSyncTask: makeBenchSuiteTask({
		type: 'product', label: 'sync', suite: PRODUCT_SYNC_SUITE, implementations: ['fast-glob', 'tinyglobby', 'node-fs-glob', 'node-glob'],
	}),
};

export const {
	regressionAsyncTask,
	regressionStreamTask,
	regressionSyncTask,
} = {
	regressionAsyncTask: makeBenchSuiteTask({
		type: 'regression', label: 'async', suite: REGRESSION_ASYNC_SUITE, implementations: ['current', 'previous'],
	}),
	regressionStreamTask: makeBenchSuiteTask({
		type: 'regression', label: 'stream', suite: REGRESSION_STREAM_SUITE, implementations: ['current', 'previous'],
	}),
	regressionSyncTask: makeBenchSuiteTask({
		type: 'regression', label: 'sync', suite: REGRESSION_SYNC_SUITE, implementations: ['current', 'previous'],
	}),
};

export const {
	overheadAsyncTask,
	overheadSyncTask,
	overStreamTask,
} = {
	overheadAsyncTask: makeBenchSuiteTask({
		type: 'overhead', label: 'async', suite: OVERHEAD_ASYNC_SUITE, implementations: ['fast-glob', 'fs-walk'], shouldIncludePartialTasks: false,
	}),
	overheadSyncTask: makeBenchSuiteTask({
		type: 'overhead', label: 'sync', suite: OVERHEAD_SYNC_SUITE, implementations: ['fast-glob', 'fs-walk'], shouldIncludePartialTasks: false,
	}),
	overStreamTask: makeBenchSuiteTask({
		type: 'overhead', label: 'stream', suite: OVERHEAD_STREAM_SUITE, implementations: ['fast-glob', 'fs-walk'], shouldIncludePartialTasks: false,
	}),
};
