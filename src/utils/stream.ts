import { Readable } from 'stream';

import * as merge2 from 'merge2';

export function merge(streams: Readable[]): NodeJS.ReadableStream {
	const mergedStream = merge2(streams);

	streams.forEach((stream) => {
		stream.once('error', (error) => mergedStream.emit('error', error));
	});

	return mergedStream;
}
