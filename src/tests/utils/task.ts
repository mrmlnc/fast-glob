import type { Task } from '../../managers/tasks';
import type { Pattern } from '../../types';

class TaskBuilder {
	readonly #task: Task = {
		base: '',
		dynamic: true,
		patterns: [],
		positive: [],
		negative: [],
	};

	public base(base: string): this {
		this.#task.base = base;

		return this;
	}

	public static(): this {
		this.#task.dynamic = false;

		return this;
	}

	public positive(pattern: Pattern): this {
		this.#task.patterns.push(pattern);
		this.#task.positive.push(pattern);

		return this;
	}

	public negative(pattern: Pattern): this {
		this.#task.patterns.push(`!${pattern}`);
		this.#task.negative.push(pattern);

		return this;
	}

	public build(): Task {
		return this.#task;
	}
}

export function builder(): TaskBuilder {
	return new TaskBuilder();
}
