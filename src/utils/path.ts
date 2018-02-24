/**
 * Returns true if the last partial of the path starting with a period.
 */
export function isDotDirectory(path: string): boolean {
	const pathPartials = path.split('/');
	const lastPathPartial: string = pathPartials[pathPartials.length - 1];

	return lastPathPartial.startsWith('.');
}

/**
 * Return naive depth of provided filepath.
 */
export function getDepth(filepath: string): number {
	return filepath.split('/').length;
}
