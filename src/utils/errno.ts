import { ErrnoException } from '../types';

export function isEnoentCodeError(err: ErrnoException): boolean {
	return err.code === 'ENOENT';
}
