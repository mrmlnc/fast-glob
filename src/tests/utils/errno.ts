import type { ErrnoException } from '../../types';

class SystemError extends Error implements ErrnoException {
	constructor(public readonly code: string, message: string) {
		super(`${code}: ${message}`);
		this.name = 'SystemError';
	}
}

export function getEnoent(): ErrnoException {
	return new SystemError('ENOENT', 'no such file or directory');
}

export function getEperm(): ErrnoException {
	return new SystemError('EPERM', 'operation not permitted');
}
