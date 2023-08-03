import type { Readable } from 'stream';

import * as merge2 from 'merge2';

export function merge(streams: Readable[]): NodeJS.ReadableStream {
	const mergedStream = merge2(streams);

	streams.forEach((stream) => {
		stream.once('error', (error) => mergedStream.emit('error', error));
	});

	mergedStream.once('close', () => propagateCloseEventToSources(streams));
	mergedStream.once('end', () => propagateCloseEventToSources(streams));

	return mergedStream;
}

function propagateCloseEventToSources(streams: Readable[]): void {
	streams.forEach((stream) => stream.emit('close'));
}
