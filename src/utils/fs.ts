import type * as fs from 'fs';

import type { Dirent } from '@nodelib/fs.walk';

class DirentFromStats implements fs.Dirent {
	public isBlockDevice: fs.Stats['isBlockDevice'];
	public isCharacterDevice: fs.Stats['isCharacterDevice'];
	public isDirectory: fs.Stats['isDirectory'];
	public isFIFO: fs.Stats['isFIFO'];
	public isFile: fs.Stats['isFile'];
	public isSocket: fs.Stats['isSocket'];
	public isSymbolicLink: fs.Stats['isSymbolicLink'];

	constructor(public name: string, stats: fs.Stats) {
		this.isBlockDevice = stats.isBlockDevice.bind(stats);
		this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
		this.isDirectory = stats.isDirectory.bind(stats);
		this.isFIFO = stats.isFIFO.bind(stats);
		this.isFile = stats.isFile.bind(stats);
		this.isSocket = stats.isSocket.bind(stats);
		this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
	}
}

export function createDirentFromStats(name: string, stats: fs.Stats): Dirent {
	return new DirentFromStats(name, stats);
}
