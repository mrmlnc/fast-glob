import * as utils from '../../utils/index.js';
import type Settings from '../../settings.js';
import type {
	MatcherOptions,
	Entry,
	EntryFilterFunction,
	Pattern,
	PatternRe,
} from '../../types/index.js';

type PatternsRegexGroup = {
	all: PatternRe[];
	/**
	 * The subset of `all` whose patterns end with `/` or `/**`. Only these are
	 * applied to a directory path with a trailing slash added; the others would
	 * otherwise match the directory itself whenever their last segment can match
	 * the empty string (`?(x)`, `*(x)`, `!(x)`).
	 */
	trailingSlash: PatternRe[];
};

type PatternsRegexSet = {
	positive: PatternsRegexGroup;
	negative: {
		absolute: PatternsRegexGroup;
		relative: PatternsRegexGroup;
	};
};

export default class EntryFilter {
	readonly #settings: Settings;
	readonly #matcherOptions: MatcherOptions;

	public readonly index = new Map<string, undefined>();

	constructor(settings: Settings, matcherOptions: MatcherOptions) {
		this.#settings = settings;
		this.#matcherOptions = matcherOptions;
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
		const isMatched = this.#isMatchToPatterns(filepath, patterns.positive, isDirectory);
		if (!isMatched) {
			return false;
		}

		const isMatchedByRelativeNegative = this.#isMatchToPatterns(filepath, patterns.negative.relative, isDirectory);
		if (isMatchedByRelativeNegative) {
			return false;
		}

		const isMatchedByAbsoluteNegative = this.#isMatchToAbsoluteNegative(filepath, patterns.negative.absolute, isDirectory);
		return !isMatchedByAbsoluteNegative;
	}

	#isMatchToAbsoluteNegative(filepath: string, patternsRe: PatternsRegexGroup, isDirectory: boolean): boolean {
		if (patternsRe.all.length === 0) {
			return false;
		}

		const fullpath = utils.path.makeAbsolute(this.#settings.cwd, filepath);

		return this.#isMatchToPatterns(fullpath, patternsRe, isDirectory);
	}

	#isMatchToPatterns(filepath: string, patternsRe: PatternsRegexGroup, isDirectory: boolean): boolean {
		if (patternsRe.all.length === 0) {
			return false;
		}

		// Trying to match files and directories by patterns.
		const isMatched = utils.pattern.isMatchAny(filepath, patternsRe.all);

		// A pattern with a trailling slash can be used for directory matching.
		// To apply such pattern, we need to add a tralling slash to the path.
		if (!isMatched && isDirectory) {
			return utils.pattern.isMatchAny(`${filepath}/`, patternsRe.trailingSlash);
		}

		return isMatched;
	}

	#convertPatternsToReGroup(patterns: Pattern[], options: MatcherOptions): PatternsRegexGroup {
		return {
			all: utils.pattern.convertPatternsToRe(patterns, options),
			trailingSlash: utils.pattern.convertPatternsToRe(patterns.filter((pattern) => pattern.endsWith('/') || pattern.endsWith('/**')), options),
		};
	}

	public getFilter(positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const [absoluteNegative, relativeNegative] = utils.pattern.partitionAbsoluteAndRelative(negative);

		const patterns: PatternsRegexSet = {
			positive: this.#convertPatternsToReGroup(positive, this.#matcherOptions),
			negative: {
				absolute: this.#convertPatternsToReGroup(absoluteNegative, { ...this.#matcherOptions, dot: true }),
				relative: this.#convertPatternsToReGroup(relativeNegative, { ...this.#matcherOptions, dot: true }),
			},
		};

		return (entry) => this.#filter(entry, patterns);
	}
}
