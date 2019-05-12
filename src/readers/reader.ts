import Settings from '../settings';
import { ReaderOptions } from '../types/index';

export default abstract class Reader<T> {
	constructor(protected readonly _settings: Settings) { }

	public abstract dynamic(root: string, options: ReaderOptions): T;
	public abstract static(filepath: string[], options: ReaderOptions): T;
}
