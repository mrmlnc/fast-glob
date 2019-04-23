import * as readdir from '@mrmlnc/readdir-enhanced';

import Settings from '../settings';

export default abstract class Reader<T> {
	constructor(protected readonly _settings: Settings) { }

	public abstract dynamic(root: string, options: readdir.Options): T;
	public abstract static(filepath: string[], options: readdir.Options): T;
}
