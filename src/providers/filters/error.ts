import * as utils from '../../utils';

import type Settings from '../../settings';
import type { ErrnoException, ErrorFilterFunction } from '../../types';

export default class ErrorFilter {
	readonly #settings: Settings;

	constructor(settings: Settings) {
		this.#settings = settings;
	}

	public getFilter(): ErrorFilterFunction {
		return (error) => this.#isNonFatalError(error);
	}

	#isNonFatalError(error: ErrnoException): boolean {
		if (this.#settings.suppressErrors) {
			return true;
		}

		if (this.#settings.errorHandler !== undefined) {
			return this.#settings.errorHandler(error);
		}

		if (utils.errno.isEnoentCodeError(error)) {
			return true;
		}

		return false;
	}
}
