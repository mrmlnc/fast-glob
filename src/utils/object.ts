export function values<T>(obj: Record<string, T>): T[] {
	return Object.keys(obj).map((key) => obj[key]);
}
