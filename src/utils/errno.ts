import type { ErrnoException } from '../types/index.js';

export function isEnoentCodeError(error: ErrnoException): boolean {
	return error.code === 'ENOENT';
}
