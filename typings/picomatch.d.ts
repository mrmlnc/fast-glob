declare module "picomatch" {
	type ScanOptions = import('micromatch').ScanOptions;
	type ScanInfoWithParts = import('micromatch').ScanInfoWithParts;

	type Api = {
		scan(pattern: string, options: ScanOptions): ScanInfoWithParts;
	};

	const api: Api;

	export = api;
}
