import * as logUpdate from 'log-update';
import * as isCi from 'is-ci';

import { SuitePackResult, Measure } from './runner';

import Table = require('easy-table'); // eslint-disable-line @typescript-eslint/no-require-imports

const FRACTION_DIGITS = 3;

export default class Reporter {
	private readonly _table: Table = new Table();
	private readonly _log: logUpdate.LogUpdate = logUpdate.create(process.stdout);

	public row(result: SuitePackResult): void {
		this._table.cell('Name', result.name);
		this._table.cell(`Time, ${result.measures.time.units}`, this._formatMeasureValue(result.measures.time));
		this._table.cell('Time stdev, %', this._formatMeasureStdevValue(result.measures.time));
		this._table.cell(`Memory, ${result.measures.memory.units}`, this._formatMeasureValue(result.measures.memory));
		this._table.cell('Memory stdev, %', this._formatMeasureStdevValue(result.measures.memory));
		this._table.cell('Entries', result.entries);
		this._table.cell('Errors', result.errors);
		this._table.cell('Retries', result.retries);
		this._table.newRow();
	}

	public format(): string {
		return this._table.toString();
	}

	public display(): void {
		if (!isCi) {
			this._log(this.format());
		}
	}

	public reset(): void {
		if (isCi) {
			console.log(this.format());
		}

		this._log.done();
	}

	private _formatMeasureValue(measure: Measure): string {
		return this._formatMeasure(measure.average);
	}

	private _formatMeasureStdevValue(measure: Measure): string {
		return this._formatMeasure(measure.stdev);
	}

	private _formatMeasure(value: number): string {
		return value.toFixed(FRACTION_DIGITS);
	}
}
