import * as utils from '../../utils';

import type Settings from '../../settings';
import type { MicromatchOptions, Entry, EntryFilterFunction, Pattern, PatternRe } from '../../types';

interface PatternsRegexSet {
	positive: {
		absolute: PatternRe[];
		relative: PatternRe[];
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
		const [absolutePositive, relativePositive] = utils.pattern.partitionAbsoluteAndRelative(positive);
		const [absoluteNegative, relativeNegative] = utils.pattern.partitionAbsoluteAndRelative(negative);

		const patterns: PatternsRegexSet = {
			positive: {
				absolute: utils.pattern.convertPatternsToRe(absolutePositive, this.#micromatchOptions),
				relative: utils.pattern.convertPatternsToRe(relativePositive, this.#micromatchOptions),
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

		if (this.#onlyFileFilter(entry) || this.#onlyDirectoryFilter(entry)) {
			return false;
		}

		const isMatched = this.#isMatchToPatternsSet(filepath, pattens, entry.dirent.isDirectory());

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

	#isMatchToPatternsSet(filepath: string, patterns: PatternsRegexSet, isDirectory: boolean): boolean {
		let fullpath = filepath;

		if (patterns.positive.absolute.length > 0 || patterns.negative.absolute.length > 0) {
			fullpath = utils.path.makeAbsolute(this.#settings.cwd, filepath);
		}

		return (
			(
				this.#isMatchToPatterns(filepath, patterns.positive.relative, isDirectory) ||
				this.#isMatchToPatterns(fullpath, patterns.positive.absolute, isDirectory)
			) &&
			!(
				this.#isMatchToPatterns(filepath, patterns.negative.relative, isDirectory) ||
				this.#isMatchToPatterns(fullpath, patterns.negative.absolute, isDirectory)
			)
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
