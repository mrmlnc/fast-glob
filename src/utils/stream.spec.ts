import * as assert from 'node:assert';
import * as stream from 'node:stream';
import { describe, it } from 'mocha';
import * as util from './stream.js';

function concat<T>(fn: (data: T[]) => void): stream.Writable {
	const data: T[] = [];

	return new stream.Writable({
		objectMode: true,
		write(chunk: T, _encoding, callback): void {
			data.push(chunk);

			callback();
		},
		final(callback): void {
			fn(data);

			callback();
		},
	});
}

describe('Utils → Stream', () => {
	describe('.merge', () => {
		it('should merge two streams into one stream', (done) => {
			const first = stream.Readable.from(['one']);
			const second = stream.Readable.from(['two']);

			const expected = ['one', 'two'];

			const mergedStream = util.merge([first, second]);

			stream.pipeline([
				mergedStream,
				concat((actual: string[]) => {
					assert.deepStrictEqual(actual, expected);
				}),
			], (error) => {
				assert.ifError(error);

				done();
			});
		});

		it('should support asynchronous iteration', async () => {
			const first = stream.Readable.from(['one']);
			const second = stream.Readable.from(['two']);

			const expected = ['one', 'two'];

			const mergedStream: AsyncIterable<string> = util.merge([first, second]);

			const actual = await Array.fromAsync(mergedStream);

			assert.deepStrictEqual(actual, expected);
		});

		it('should propagate first error into merged stream (first)', (done) => {
			const first = new stream.Readable({
				read() {
					this.destroy(new Error('1'));
				},
			});
			const second = stream.Readable.from([]);

			const expected = '1';

			const mergedStream = util.merge([first, second]);

			stream.pipeline([
				mergedStream,
				concat(() => {
					assert.fail('Should not reach the concat callback');
				}),
			], (error) => {
				assert.strictEqual(error?.message, expected);

				done();
			});
		});

		it('should propagate first error into merged stream (second)', (done) => {
			const first = stream.Readable.from([]);
			const second = new stream.Readable({
				read() {
					this.destroy(new Error('2'));
				},
			});

			const expected = '2';

			const mergedStream = util.merge([first, second]);

			stream.pipeline([
				mergedStream,
				concat(() => {
					assert.fail('Should not reach the concat callback');
				}),
			], (error) => {
				assert.strictEqual(error?.message, expected);

				done();
			});
		});

		it('should propagate destroy to source streams', (done) => {
			const first = stream.Readable.from([]);
			const second = stream.Readable.from([]);

			const mergedStream = util.merge([first, second]);

			const expected = [1, 2];

			const actual: number[] = [];

			let closeCount = 0;

			first.once('close', () => {
				closeCount++;

				actual.push(1);

				checkCloses();
			});
			second.once('close', () => {
				closeCount++;

				actual.push(2);

				checkCloses();
			});
			mergedStream.once('close', () => {
				closeCount++;

				checkCloses();
			});

			mergedStream.destroy();

			function checkCloses(): void {
				if (closeCount !== 3) {
					return;
				}

				assert.deepStrictEqual(actual, expected);

				done();
			}
		});
	});
});
