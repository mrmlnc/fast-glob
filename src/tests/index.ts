import * as stream from 'stream';

import { EntryItem } from '../types/entries';

export class FakeStream extends stream.Readable {
	constructor(private readonly value: EntryItem, private readonly error: Error | null, opts?: stream.ReadableOptions) {
		super(opts);
	}

	public _read(): void {
		if (this.error === null) {
			this.emit('data', this.value);
		} else {
			this.emit('error', this.error);
		}
		this.push(null);
	}
}

export class EnoentErrnoException extends Error {
	public readonly code: string = 'ENOENT';

	constructor() {
		super();
	}
}
