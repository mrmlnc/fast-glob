import * as utils from '../../utils/index.js';

import type Settings from '../../settings.js';
import type { MicromatchOptions, Entry, EntryFilterFunction, Pattern, PatternRe } from '../../types/index.js';

interface PatternsRegexSet {
	positive: {
		all: PatternRe[];
	};
	negative: {
		absolute: PatternRe[];
		relative: PatternRe[];
	};
}

export default class EntryFilter {
	public readonly index = new Map<string, undefined>();

	readonly #settings: Settings;
	readonly #micromatchOptions: MicromatchOptions;

	constructor(settings: Settings, micromatchOptions: MicromatchOptions) {
		this.#settings = settings;
		this.#micromatchOptions = micromatchOptions;
	}

	public getFilter(positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const [absoluteNegative, relativeNegative] = utils.pattern.partitionAbsoluteAndRelative(negative);

		const patterns: PatternsRegexSet = {
			positive: {
				all: utils.pattern.convertPatternsToRe(positive, this.#micromatchOptions),
			},
			negative: {
				absolute: utils.pattern.convertPatternsToRe(absoluteNegative, { ...this.#micromatchOptions, dot: true }),
				relative: utils.pattern.convertPatternsToRe(relativeNegative, { ...this.#micromatchOptions, dot: true }),
			},
		};

		return (entry) => this.#filter(entry, patterns);
	}

	#filter(entry: Entry, pattens: PatternsRegexSet): boolean {
		const filepath = utils.path.removeLeadingDotSegment(entry.path);

		if (this.#settings.unique && this.#isDuplicateEntry(filepath)) {
			return false;
		}

		const isDirectory = entry.dirent.isDirectory();

		if (this.#onlyFileFilter(isDirectory) || this.#onlyDirectoryFilter(isDirectory)) {
			return false;
		}

		const isMatched = this.#isMatchToPatternsSet(filepath, pattens, isDirectory);

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

	#onlyFileFilter(isDirectory: boolean): boolean {
		return this.#settings.onlyFiles && isDirectory;
	}

	#onlyDirectoryFilter(isDirectory: boolean): boolean {
		return this.#settings.onlyDirectories && !isDirectory;
	}

	#isMatchToPatternsSet(filepath: string, patterns: PatternsRegexSet, isDirectory: boolean): boolean {
		let fullpath = filepath;

		if (patterns.negative.absolute.length > 0) {
			fullpath = utils.path.makeAbsolute(this.#settings.cwd, filepath);
		}

		const isMatched = this.#isMatchToPatterns(filepath, patterns.positive.all, isDirectory);

		return isMatched && !(
			this.#isMatchToPatterns(filepath, patterns.negative.relative, isDirectory) ||
			this.#isMatchToPatterns(fullpath, patterns.negative.absolute, isDirectory)
		);
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
