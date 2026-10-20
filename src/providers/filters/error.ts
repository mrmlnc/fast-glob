import * as utils from '../../utils/index.js';
import type Settings from '../../settings.js';
import type { ErrnoException, ErrorFilterFunction } from '../../types/index.js';

export default class ErrorFilter {
	readonly #settings: Settings;

	constructor(settings: Settings) {
		this.#settings = settings;
	}

	#isNonFatalError(error: ErrnoException): boolean {
		if (this.#settings.errorFilter !== undefined) {
			return this.#settings.errorFilter(error);
		}

		return utils.errno.isEnoentCodeError(error) || utils.errno.isEnotdirCodeError(error);
	}

	public getFilter(): ErrorFilterFunction {
		return (error) => this.#isNonFatalError(error);
	}
}
