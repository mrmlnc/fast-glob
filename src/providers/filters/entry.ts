import Settings from '../../settings';
import { Entry, EntryFilterFunction, MicromatchOptions, Pattern, PatternRe } from '../../types/index';
import * as utils from '../../utils/index';

export default class EntryFilter {
	public readonly index: Map<string, undefined> = new Map();

	constructor(private readonly settings: Settings, private readonly micromatchOptions: MicromatchOptions) { }

	/**
	 * Returns filter for directories.
	 */
	public getFilter(positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const positiveRe: PatternRe[] = utils.pattern.convertPatternsToRe(positive, this.micromatchOptions);
		const negativeRe: PatternRe[] = utils.pattern.convertPatternsToRe(negative, this.micromatchOptions);

		return (entry: Entry) => this.filter(entry, positiveRe, negativeRe);
	}

	/**
	 * Returns true if entry must be added to result.
	 */
	private filter(entry: Entry, positiveRe: PatternRe[], negativeRe: PatternRe[]): boolean {
		// Exclude duplicate results
		if (this.settings.unique) {
			if (this.isDuplicateEntry(entry)) {
				return false;
			}

			this.createIndexRecord(entry);
		}

		// Filter files and directories by options
		if (this.onlyFileFilter(entry) || this.onlyDirectoryFilter(entry)) {
			return false;
		}

		if (this.isSkippedByAbsoluteNegativePatterns(entry, negativeRe)) {
			return false;
		}

		return this.isMatchToPatterns(entry.path, positiveRe) && !this.isMatchToPatterns(entry.path, negativeRe);
	}

	/**
	 * Return true if the entry already has in the cross reader index.
	 */
	private isDuplicateEntry(entry: Entry): boolean {
		return this.index.has(entry.path);
	}

	/**
	 * Create record in the cross reader index.
	 */
	private createIndexRecord(entry: Entry): void {
		this.index.set(entry.path, undefined);
	}

	/**
	 * Returns true for non-files if the «onlyFiles» option is enabled.
	 */
	private onlyFileFilter(entry: Entry): boolean {
		return this.settings.onlyFiles && !entry.isFile();
	}

	/**
	 * Returns true for non-directories if the «onlyDirectories» option is enabled.
	 */
	private onlyDirectoryFilter(entry: Entry): boolean {
		return this.settings.onlyDirectories && !entry.isDirectory();
	}

	/**
	 * Return true when `absolute` option is enabled and matched to the negative patterns.
	 */
	private isSkippedByAbsoluteNegativePatterns(entry: Entry, negativeRe: PatternRe[]): boolean {
		if (!this.settings.absolute) {
			return false;
		}

		const fullpath = utils.path.makeAbsolute(this.settings.cwd, entry.path);

		return this.isMatchToPatterns(fullpath, negativeRe);
	}

	/**
	 * Return true when entry match to provided patterns.
	 *
	 * First, just trying to apply patterns to the path.
	 * Second, trying to apply patterns to the path with final slash (need to micromatch to support «directory/**» patterns).
	 */
	private isMatchToPatterns(filepath: string, patternsRe: PatternRe[]): boolean {
		return utils.pattern.matchAny(filepath, patternsRe) || utils.pattern.matchAny(filepath + '/', patternsRe);
	}
}
