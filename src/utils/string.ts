export function isString(input: unknown): input is string {
	return typeof input === 'string';
}

export function isEmpty(input: string): boolean {
	return input === '';
}
