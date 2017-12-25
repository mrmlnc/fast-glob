import * as optionsManager from './managers/options';
import * as readdir from './providers/readdir';
import * as task from './utils/task';

import { TEntryItem } from './types/entries';

import { IOptions, IPartialOptions } from './managers/options';

interface IInputAPI {
	patterns: string[];
	options: IOptions;
	api: typeof readdir;
}

function prepareInput(source: string | string[], options?: IPartialOptions): IInputAPI {
	return {
		patterns: ([] as string[]).concat(source),
		options: optionsManager.prepare(options),
		api: readdir
	};
}

export default function async(source: string | string[], options?: IPartialOptions): Promise<TEntryItem[]> {
	const input = prepareInput(source, options);

	return Promise.all(task.generateTasks(input.patterns, input.options).map((work) => input.api.async(work, input.options)))
		.then((entries) => entries.reduce((res, to) => ([] as TEntryItem[]).concat(res, to), []));
}

export function sync(source: string | string[], options?: IPartialOptions): TEntryItem[] {
	const input = prepareInput(source, options);

	return task.generateTasks(input.patterns, input.options)
		.map((work) => input.api.sync(work, input.options))
		.reduce((res, to) => ([] as TEntryItem[]).concat(res, to), []);
}
