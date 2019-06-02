import * as stream from 'stream';

import { EntryItem } from '../types/index';

import * as entry from './utils/entry';
import * as errno from './utils/errno';

export class FakeStream extends stream.Readable {
	constructor(private readonly _value: EntryItem, private readonly _error: Error | null, opts?: stream.ReadableOptions) {
		super(opts);
	}

	public _read(): void {
		if (this._error === null) {
			this.emit('data', this._value);
		} else {
			this.emit('error', this._error);
		}
		this.push(null);
	}
}

export {
	entry,
	errno
};
