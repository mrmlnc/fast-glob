import { ISuitePackResult } from './runner';

export default class Reporter {
	constructor(private readonly results: ISuitePackResult) { }

	public toString(): string {
		return this.header + '\n' + this.measures + ' | ' + this.meta;
	}

	private get header(): string {
		return this.results.name;
	}

	private get meta(): string {
		const matches: string = 'Entries: ' + this.units(this.results.entries, '');
		const errors: string = 'Errors: ' + this.units(this.results.errors, '');
		const retries: string = 'Retries: ' + this.units(this.results.retries, '');

		return [matches, errors, retries].join(' | ');
	}

	private get measures(): string {
		return Object.keys(this.results.measures).map(this.measure, this).join(' | ');
	}

	private measure(name: string): string {
		const data = this.results.measures[name];

		return [
			'(' + name.toUpperCase() + ')',
			this.units(data.average, data.units, 3),
			'±' + this.units(data.stdev, '%', 3)
		].join(' ');
	}

	private units(value: number, units: string, faction?: number): string {
		return value.toFixed(faction).toString() + units;
	}
}
