import * as utils from '../../utils';

import type Settings from '../../settings';
import type { Entry, EntryFilterFunction, MicromatchOptions, Pattern, PatternRe } from '../../types';

export default class EntryFilter {
	public readonly index = new Map<string, undefined>();

	readonly #settings: Settings;
	readonly #micromatchOptions: MicromatchOptions;

	constructor(settings: Settings, micromatchOptions: MicromatchOptions) {
		this.#settings = settings;
		this.#micromatchOptions = micromatchOptions;
	}

	public getFilter(positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const positiveRe = utils.pattern.convertPatternsToRe(positive, this.#micromatchOptions);
		const negativeRe = utils.pattern.convertPatternsToRe(negative, {
			...this.#micromatchOptions,
			dot: true,
		});

		return (entry) => this.#filter(entry, positiveRe, negativeRe);
	}

	#filter(entry: Entry, positiveRe: PatternRe[], negativeRe: PatternRe[]): boolean {
		const filepath = utils.path.removeLeadingDotSegment(entry.path);

		if (this.#settings.unique && this.#isDuplicateEntry(filepath)) {
			return false;
		}

		if (this.#onlyFileFilter(entry) || this.#onlyDirectoryFilter(entry)) {
			return false;
		}

		if (this.#isSkippedByAbsoluteNegativePatterns(filepath, negativeRe)) {
			return false;
		}

		const isDirectory = entry.dirent.isDirectory();

		const isMatched = this.#isMatchToPatterns(filepath, positiveRe, isDirectory) && !this.#isMatchToPatterns(filepath, negativeRe, isDirectory);

		if (this.#settings.unique && isMatched) {
			this.#createIndexRecord(filepath);
		}

		return isMatched;
	}

	#isDuplicateEntry(filepath: string): boolean {
		return this.index.has(filepath);
	}

	#createIndexRecord(filepath: string): void {
		this.index.set(filepath, undefined);
	}

	#onlyFileFilter(entry: Entry): boolean {
		return this.#settings.onlyFiles && !entry.dirent.isFile();
	}

	#onlyDirectoryFilter(entry: Entry): boolean {
		return this.#settings.onlyDirectories && !entry.dirent.isDirectory();
	}

	#isSkippedByAbsoluteNegativePatterns(entryPath: string, patternsRe: PatternRe[]): boolean {
		if (!this.#settings.absolute) {
			return false;
		}

		const fullpath = utils.path.makeAbsolute(this.#settings.cwd, entryPath);

		return utils.pattern.matchAny(fullpath, patternsRe);
	}

	#isMatchToPatterns(filepath: string, patternsRe: PatternRe[], isDirectory: boolean): boolean {
		// Trying to match files and directories by patterns.
		const isMatched = utils.pattern.matchAny(filepath, patternsRe);

		// A pattern with a trailling slash can be used for directory matching.
		// To apply such pattern, we need to add a tralling slash to the path.
		if (!isMatched && isDirectory) {
			return utils.pattern.matchAny(`${filepath}/`, patternsRe);
		}

		return isMatched;
	}
}
