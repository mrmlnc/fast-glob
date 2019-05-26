import Settings from '../../settings';
import { ErrorFilterFunction } from '../../types';

export default class ErrorFilter {
	constructor(private readonly _settings: Settings) { }

	public getFilter(): ErrorFilterFunction {
		return () => this._settings.suppressErrors;
	}
}
