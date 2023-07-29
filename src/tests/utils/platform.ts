import * as os from 'os';

export function isWindows(): boolean {
	return os.platform() === 'win32';
}

export function isMacos(): boolean {
	return os.platform() === 'darwin';
}

export function isUnix(): boolean {
	return os.platform() === 'linux';
}
