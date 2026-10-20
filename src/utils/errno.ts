import type { ErrnoException } from '../types/index.js';

export function isEnoentCodeError(error: ErrnoException): boolean {
	return error.code === 'ENOENT';
}

export function isEnotdirCodeError(error: ErrnoException): boolean {
	return error.code === 'ENOTDIR';
}
