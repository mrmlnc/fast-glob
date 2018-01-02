import * as optionsManager from './managers/options';
import * as tasksManager from './managers/tasks';
import * as readdir from './providers/readdir';

import { IOptions, IPartialOptions } from './managers/options';
import { TEntryItem } from './types/entries';
import { TPattern } from './types/patterns';

interface IInputAPI {
	patterns: TPattern[];
	options: IOptions;
	api: typeof readdir;
}

function prepareInput(source: TPattern | TPattern[], options?: IPartialOptions): IInputAPI {
	return {
		patterns: ([] as string[]).concat(source),
		options: optionsManager.prepare(options),
		api: readdir
	};
}

export default function async(source: TPattern | TPattern[], options?: IPartialOptions): Promise<TEntryItem[]> {
	const input = prepareInput(source, options);

	return Promise.all(tasksManager.generate(input.patterns, input.options).map((work) => input.api.async(work, input.options)))
		.then((entries) => entries.reduce((res, to) => ([] as TEntryItem[]).concat(res, to), []));
}

export function sync(source: TPattern | TPattern[], options?: IPartialOptions): TEntryItem[] {
	const input = prepareInput(source, options);

	return tasksManager.generate(input.patterns, input.options)
		.map((work) => input.api.sync(work, input.options))
		.reduce((res, to) => ([] as TEntryItem[]).concat(res, to), []);
}
