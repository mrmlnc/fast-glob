import merge2 = require('merge2');

export function merge(streams: NodeJS.ReadableStream[]): NodeJS.ReadableStream {
	const mergedStream = merge2(streams);

	streams.forEach((stream) => {
		stream.once('error', (err) => mergedStream.emit('error', err));
	});

	return mergedStream;
}
