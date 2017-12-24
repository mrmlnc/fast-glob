export function head(msg: string): void {
	console.info(`===> ${msg}`);
}

export function subhead(msg: string): void {
	console.info(`======> ${msg}`);
}

export function newline(): void {
	console.log();
}
