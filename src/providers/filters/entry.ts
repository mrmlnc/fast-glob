import * as utils from '../../utils/index.js';
import type Settings from '../../settings.js';
import type {
	MatcherOptions,
	Entry,
	EntryFilterFunction,
	Pattern,
	PatternRe,
} from '../../types/index.js';

type PatternsRegexSet = {
	positive: {
		all: PatternRe[];
	};
	negative: {
		absolute: PatternRe[];
		relative: PatternRe[];
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
		this.#repairBrokenDirent(entry);

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

	/**
	 * The async provider of `@nodelib/fs.scandir` replaces the dirent of every
	 * entry with a `DirentFromStats` whose `isDirectory` (and friends) always
	 * return `false` (fixed upstream in nodelib/nodelib@00472f3e4186, not
	 * released yet). When that happens, `@nodelib/fs.walk` never descends into
	 * subdirectories, so `stats: true` silently drops nested files from async
	 * and stream results (see #547).
	 *
	 * This restores a working dirent from the stats that were already collected.
	 * It only runs when the stats and the dirent disagree about the entry being
	 * a directory, so it is a no-op once the dependency is fixed upstream.
	 * It is also skipped when symbolic links are not followed, so a symlinked
	 * directory keeps reporting as a symbolic link.
	 */
	#repairBrokenDirent(entry: Entry): void {
		if (!this.#settings.stats || !this.#settings.followSymbolicLinks) {
			return;
		}

		if (entry.stats === undefined || !entry.stats.isDirectory() || entry.dirent.isDirectory()) {
			return;
		}

		entry.dirent = utils.fs.createDirentFromStats(entry.name, entry.stats);
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
		const isMatched = this.#isMatchToPatterns(filepath, patterns.positive.all, isDirectory);
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

	#isMatchToAbsoluteNegative(filepath: string, patternsRe: PatternRe[], isDirectory: boolean): boolean {
		if (patternsRe.length === 0) {
			return false;
		}

		const fullpath = utils.path.makeAbsolute(this.#settings.cwd, filepath);

		return this.#isMatchToPatterns(fullpath, patternsRe, isDirectory);
	}

	#isMatchToPatterns(filepath: string, patternsRe: PatternRe[], isDirectory: boolean): boolean {
		if (patternsRe.length === 0) {
			return false;
		}

		// Trying to match files and directories by patterns.
		const isMatched = utils.pattern.isMatchAny(filepath, patternsRe);

		// A pattern with a trailling slash can be used for directory matching.
		// To apply such pattern, we need to add a tralling slash to the path.
		if (!isMatched && isDirectory) {
			return utils.pattern.isMatchAny(`${filepath}/`, patternsRe);
		}

		return isMatched;
	}

	public getFilter(positive: Pattern[], negative: Pattern[]): EntryFilterFunction {
		const [absoluteNegative, relativeNegative] = utils.pattern.partitionAbsoluteAndRelative(negative);

		const patterns: PatternsRegexSet = {
			positive: {
				all: utils.pattern.convertPatternsToRe(positive, this.#matcherOptions),
			},
			negative: {
				absolute: utils.pattern.convertPatternsToRe(absoluteNegative, { ...this.#matcherOptions, dot: true }),
				relative: utils.pattern.convertPatternsToRe(relativeNegative, { ...this.#matcherOptions, dot: true }),
			},
		};

		return (entry) => this.#filter(entry, patterns);
	}
}
