import merge2 = require('merge2');

/**
 * Merge multiple streams and propagate their errors into one stream in parallel.
 */
export function merge(streams: NodeJS.ReadableStream[]): NodeJS.ReadableStream {
	const mergedStream = merge2(streams);

	streams.forEach((stream) => {
		stream.on('error', (err) => mergedStream.emit('error', err));
	});

	return mergedStream;
}
