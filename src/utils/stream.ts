import merge2 = require('merge2');

/**
 * Merge multiple streams and propagate their errors into one stream in parallel.
 */
export function merge(streams: NodeJS.ReadableStream[]): NodeJS.ReadableStream {
	/**
	 * Multiplexing leads to the creation of a new stream.
	 * If the source is one, then there is nothing to multiplex.
	 */
	if (streams.length === 1) {
		return streams[0];
	}

	const mergedStream = merge2(streams);

	streams.forEach((stream) => {
		stream.on('error', (err) => mergedStream.emit('error', err));
	});

	return mergedStream;
}
