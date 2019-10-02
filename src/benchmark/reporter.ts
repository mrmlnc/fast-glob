import { SuitePackResult, SuitePackMeasures } from './runner';

const FRACTION_DIGITS = 3;

export default class Reporter {
	constructor(private readonly _results: SuitePackResult) { }

	public toString(): string {
		return this._formatHeader() + '\n' + this._formatMeasures() + ' | ' + this._formatMeta();
	}

	private _formatHeader(): string {
		return this._results.name;
	}

	private _formatMeta(): string {
		const matches = 'Entries: ' + this._formatValue(this._results.entries, '');
		const errors = 'Errors: ' + this._formatValue(this._results.errors, '');
		const retries = 'Retries: ' + this._formatValue(this._results.retries, '');

		return [matches, errors, retries].join(' | ');
	}

	private _formatMeasures(): string {
		const keys = Object.keys(this._results.measures) as Array<keyof SuitePackMeasures>;

		return keys.map(this._formatMeasure, this).join(' | ');
	}

	private _formatMeasure(name: keyof SuitePackMeasures): string {
		const data = this._results.measures[name];

		return [
			'(' + name.toUpperCase() + ')',
			this._formatValue(data.average, data.units, FRACTION_DIGITS),
			'±' + this._formatValue(data.stdev, '%', FRACTION_DIGITS)
		].join(' ');
	}

	private _formatValue(value: number, units: string, faction?: number): string {
		return value.toFixed(faction).toString() + units;
	}
}
