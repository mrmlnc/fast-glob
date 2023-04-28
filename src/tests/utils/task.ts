import { Task } from '../../managers/tasks';
import { Pattern } from '../../types';

class TaskBuilder {
	private readonly _task: Task = {
		base: '',
		dynamic: true,
		patterns: [],
		positive: [],
		negative: [],
	};

	public base(base: string): this {
		this._task.base = base;

		return this;
	}

	public static(): this {
		this._task.dynamic = false;

		return this;
	}

	public positive(pattern: Pattern): this {
		this._task.patterns.push(pattern);
		this._task.positive.push(pattern);

		return this;
	}

	public negative(pattern: Pattern): this {
		this._task.patterns.push(`!${pattern}`);
		this._task.negative.push(pattern);

		return this;
	}

	public build(): Task {
		return this._task;
	}
}

export function builder(): TaskBuilder {
	return new TaskBuilder();
}
