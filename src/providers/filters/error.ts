import type Settings from '../../settings';
import type { ErrnoException, ErrorFilterFunction } from '../../types';
import * as utils from '../../utils';

export default class ErrorFilter {
	constructor(private readonly _settings: Settings) { }

	public getFilter(): ErrorFilterFunction {
		return (error) => this._isNonFatalError(error);
	}

	private _isNonFatalError(error: ErrnoException): boolean {
		return utils.errno.isEnoentCodeError(error) || this._settings.suppressErrors;
	}
}
