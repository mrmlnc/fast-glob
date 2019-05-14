import * as path from 'path';

import Settings from '../../settings';
import { Entry, EntryFilterFunction, MicromatchOptions, Pattern, PatternRe } from '../../types/index';
import * as utils from '../../utils/index';

export default class EntryFilter {
	public readonly index: Map<string, undefined> = new Map();

	constructor(private readonly _settings: Settings, private readonly _micromatchOptions: MicromatchOptions) { }

	/**
	 * Returns filter for directories.
	 */
	public getFilter(positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const positiveRe: PatternRe[] = utils.pattern.convertPatternsToRe(positive, this._micromatchOptions);
		const negativeRe: PatternRe[] = utils.pattern.convertPatternsToRe(negative, this._micromatchOptions);

		return (entry: Entry) => this._filter(entry, positiveRe, negativeRe);
	}

	/**
	 * Returns true if entry must be added to result.
	 */
	private _filter(entry: Entry, positiveRe: PatternRe[], negativeRe: PatternRe[]): boolean {
		// Exclude duplicate results
		if (this._settings.unique) {
			if (this._isDuplicateEntry(entry)) {
				return false;
			}

			this._createIndexRecord(entry);
		}

		// Filter files and directories by options
		if (this._onlyFileFilter(entry) || this._onlyDirectoryFilter(entry)) {
			return false;
		}

		if (this._isSkippedByAbsoluteNegativePatterns(entry, negativeRe)) {
			return false;
		}

		return this._isMatchToPatterns(entry.path, positiveRe) && !this._isMatchToPatterns(entry.path, negativeRe);
	}

	/**
	 * Return true if the entry already has in the cross reader index.
	 */
	private _isDuplicateEntry(entry: Entry): boolean {
		return this.index.has(entry.path);
	}

	/**
	 * Create record in the cross reader index.
	 */
	private _createIndexRecord(entry: Entry): void {
		this.index.set(entry.path, undefined);
	}

	/**
	 * Returns true for non-files if the «onlyFiles» option is enabled.
	 */
	private _onlyFileFilter(entry: Entry): boolean {
		return this._settings.onlyFiles && !entry.isFile();
	}

	/**
	 * Returns true for non-directories if the «onlyDirectories» option is enabled.
	 */
	private _onlyDirectoryFilter(entry: Entry): boolean {
		return this._settings.onlyDirectories && !entry.isDirectory();
	}

	/**
	 * Return true when `absolute` option is enabled and matched to the negative patterns.
	 */
	private _isSkippedByAbsoluteNegativePatterns(entry: Entry, negativeRe: PatternRe[]): boolean {
		if (!this._settings.absolute) {
			return false;
		}

		const fullpath = utils.path.makeAbsolute(this._settings.cwd, entry.path);

		return this._isMatchToPatterns(fullpath, negativeRe);
	}

	/**
	 * Return true when entry match to provided patterns.
	 *
	 * First, just trying to apply patterns to the path.
	 * Second, trying to apply patterns to the path with final slash (need to micromatch to support «directory/**» patterns).
	 */
	private _isMatchToPatterns(filepath: string, patternsRe: PatternRe[]): boolean {
		return utils.pattern.matchAny(filepath, patternsRe) || utils.pattern.matchAny(filepath + path.sep, patternsRe);
	}
}
