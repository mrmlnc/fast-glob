export function isString(input: unknown): input is string {
	return typeof input === 'string';
}

export function isEmpty(input: string): boolean {
	return input === '';
}

/**
 * Flattens the underlying C structures of a concatenated JavaScript string.
 *
 * More details: https://github.com/davidmarkclements/flatstr
 */
export function flatHeavilyConcatenatedString(input: string): string {
	// @ts-expect-error Another solution can be `.trim`, but it changes the string.
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-bitwise, unicorn/prefer-math-trunc
	input | 0;

	return input;
}
