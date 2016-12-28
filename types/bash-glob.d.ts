declare module "bash-glob" {

	function bashGlob(pattern: string | string[], callback: (err: Error, files: string[]) => void);
	function bashGlob(pattern: string | string[], options: bashGlob.IOptions, callback: (err: Error, files: string[]) => void);

	namespace bashGlob {
		interface IOptions {
			cwd?: string;
			dotglob?: boolean;
			extglob?: boolean;
			failglob?: boolean;
			globstar?: boolean;
			nocaseglob?: boolean;
			nullglob?: boolean;
		}

		function on(event: string, callback: (match: string, cwd: string) => void);

		function each(patterns: string[], callback: (err: Error, files: string[]) => void);
		function each(patterns: string[], options: IOptions, callback: (err: Error, files: string[]) => void);

		function sync(pattern: string | string[]): string[];
		function sync(pattern: string | string[], options: bashGlob.IOptions): string[];
	}

	export = bashGlob;
}
