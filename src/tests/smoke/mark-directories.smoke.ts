import * as smoke from './smoke';

smoke.suite('Smoke → MarkDirectories', [
	{
		pattern: 'fixtures/**/*',
		globOptions: { mark: true },
		fgOptions: { markDirectories: true }
	}
]);
