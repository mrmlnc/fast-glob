import type { ErrnoException } from '../types';

export function isEnoentCodeError(error: ErrnoException): boolean {
	return error.code === 'ENOENT';
}
