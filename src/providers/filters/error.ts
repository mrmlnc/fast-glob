import * as utils from '../../utils/index.js';

import type Settings from '../../settings.js';
import type { ErrnoException, ErrorFilterFunction } from '../../types/index.js';

export default class ErrorFilter {
	readonly #settings: Settings;

	constructor(settings: Settings) {
		this.#settings = settings;
	}

	public getFilter(): ErrorFilterFunction {
		return (error) => this.#isNonFatalError(error);
	}

	#isNonFatalError(error: ErrnoException): boolean {
		return utils.errno.isEnoentCodeError(error) || this.#settings.suppressErrors;
	}
}
