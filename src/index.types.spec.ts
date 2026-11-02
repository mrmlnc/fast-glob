import * as assert from 'node:assert';
import { describe, it } from 'mocha';
import * as fg from './index.js';

describe('Package types', () => {
	it('should retain string results when object output is disabled', async () => {
		const sync = fg.globSync('fixtures/file.md');
		const async = await fg.glob('fixtures/file.md', { objectMode: false, stats: false });

		assert.deepStrictEqual(sync satisfies string[], ['fixtures/file.md']);
		assert.deepStrictEqual(async satisfies string[], sync);
	});

	it('should retain object results when object output is enabled', async () => {
		const sync = fg.globSync('fixtures/file.md', { objectMode: true });
		const async = await fg.glob('fixtures/file.md', { stats: true });

		assert.strictEqual((sync satisfies fg.Entry[])[0].path, 'fixtures/file.md');
		assert.strictEqual((async satisfies fg.Entry[])[0].path, sync[0].path);
	});

	it('should include objects in results for options with unknown output modes', async () => {
		const options: fg.Options = { objectMode: true };
		const inferredOptions = { stats: true };
		const sync = fg.globSync('fixtures/file.md', options);
		const async = await fg.glob('fixtures/file.md', inferredOptions);

		assert.ok(Array.isArray(sync satisfies Array<string | fg.Entry>));
		assert.ok(Array.isArray(async satisfies Array<string | fg.Entry>));
		// @ts-expect-error Options may enable object output.
		assert.strictEqual(typeof (sync satisfies string[])[0], 'object');
		// @ts-expect-error A widened boolean may enable stats and object output.
		assert.strictEqual(typeof (async satisfies string[])[0], 'object');
	});

	it('should iterate over strings when stream object output is disabled', async () => {
		const entries: string[] = [];

		for await (const entry of fg.globStream('fixtures/file.md')) {
			entries.push(entry satisfies string);
		}

		assert.deepStrictEqual(entries, ['fixtures/file.md']);
	});

	it('should iterate over objects when stream object output is enabled', async () => {
		const entries: fg.Entry[] = [];

		for await (const entry of fg.globStream('fixtures/file.md', { stats: true })) {
			entries.push(entry satisfies fg.Entry);
		}

		assert.strictEqual(entries[0].path, 'fixtures/file.md');
		assert.ok(entries[0].stats);
	});

	it('should include objects when stream output modes are unknown', async () => {
		const options: fg.Options = { objectMode: true };
		const entries: Array<string | fg.Entry> = [];

		for await (const entry of fg.globStream('fixtures/file.md', options)) {
			entries.push(entry satisfies string | fg.Entry);
			// @ts-expect-error Options may enable object output.
			assert.strictEqual(typeof (entry satisfies string), 'object');
		}

		assert.strictEqual(entries.length, 1);
	});

	it('should preserve entry types when advancing a stream iterator manually', async () => {
		const iterator = fg.globStream('fixtures/file.md', { objectMode: true })[Symbol.asyncIterator]();
		const result = await iterator.next();

		assert.ok(!result.done);
		assert.strictEqual((result.value satisfies fg.Entry).path, 'fixtures/file.md');
		// @ts-expect-error Object output must not become an untyped iterator value.
		assert.strictEqual(typeof (result.value satisfies string), 'object');
		const end = await iterator.next();

		assert.ok(end.done);
	});
});
