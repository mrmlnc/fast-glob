import { Readable } from 'stream';

// @ts-expect-error
import * as ordered from 'ordered-read-streams';

export function merge(streams: Readable[]): Readable {
	return ordered(streams);
}
