import Settings from '../../settings';
import { ErrnoException, ErrorFilterFunction } from '../../types';
import * as utils from '../../utils/index';

export default class ErrorFilter {
	constructor(private readonly _settings: Settings) { }

	public getFilter(): ErrorFilterFunction {
		return (error) => this._isNonFatalError(error);
	}

	private _isNonFatalError(error: ErrnoException): boolean {
		return utils.errno.isEnoentCodeError(error) || this._settings.suppressErrors;
	}
}
