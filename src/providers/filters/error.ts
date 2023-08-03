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
		return utils.errno.isEnoentCodeError(error) || this.#settings.suppressErrors;
	}
}
