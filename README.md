# :rocket: fast-glob

> Is a faster [`node-glob`](https://github.com/isaacs/node-glob) alternative.

## :bulb: Highlights

  * :rocket: Fast by using Streams and Promises. Uses [readdir-enhanced](https://github.com/BigstickCarpet/readdir-enhanced) and [micromatch](https://github.com/jonschlinkert/micromatch).
  * :beginner: User-friendly, since it supports multiple and negated patterns (`['*', '!*.md']`).
  * :vertical_traffic_light: Rational, because it doesn't read excluded directories (`!**/node_modules/**`).
  * :gear: Universal, because it supports Synchronous, Promise and Stream API.
  * :money_with_wings: Economy, because it provides `fs.Stats` for matched path if you wanted.

## Donate

If you want to thank me, or promote your Issue.

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/mrmlnc)

> Sorry, but I have work and support for packages requires some time after work. I will be glad of your support and PR's.

## Install

```
$ npm install --save fast-glob
```

## Usage

#### Asynchronous

```js
const fg = require('fast-glob');

fg(['src/**/*.js', '!src/**/*.spec.js']).then((entries) => console.log(entries));
fg.async(['src/**/*.js', '!src/**/*.spec.js']).then((entries) => console.log(entries));
```

#### Synchronous

```js
const fg = require('fast-glob');

const entries = fg.sync(['src/**/*.js', '!src/**/*.spec.js']);
console.log(entries);
```

#### Stream

```js
const fg = require('fast-glob');

const stream = fg.stream(['src/**/*.js', '!src/**/*.spec.js']);

const entries = [];

stream.on('data', (entry) => entries.push(entry));
stream.once('error', console.log);
stream.once('end', () => console.log(entries));
```

## API

### fg(patterns, [options])
### fg.async(patterns, [options])

Returns a `Promise` with an array of matching [entries](#entry).

### fg.sync(patterns, [options])

Returns an array of matching [entries](#entry).

### fg.stream(patterns, [options])

Returns a [`ReadableStream`](https://nodejs.org/api/stream.html#stream_readable_streams) when the `data` event will be emitted with [`Entry`](#entry).

#### patterns

  * Type: `string|string[]`

This package does not respect the order of patterns. First, all the negative patterns are applied, and only then the positive patterns.

#### options

  * Type: `Object`

See [options](#options-1) section for more detailed information.

### fg.generateTasks(patterns, [options])

Return a set of tasks based on provided patterns. All tasks satisfy the `Task` interface:

```ts
interface Task {
  /**
   * Parent directory for all patterns inside this task.
   */
  base: string;
  /**
   * Dynamic or static patterns are in this task.
   */
  dynamic: boolean;
  /**
   * All patterns.
   */
  patterns: string[];
  /**
   * Only positive patterns.
   */
  positive: string[];
  /**
   * Only negative patterns without ! symbol.
   */
  negative: string[];
}
```

## Entry

The entry which can be a `string` if the [`stats`](#stats) option is disabled, otherwise `fs.Stats` with two additional `path` and `depth` properties.

## Options

#### concurrency

  * Type: `number`
  * Default: `Infinity`

The maximum number of concurrent calls to `fs.readdir`.

See more more detailed description in the [`fs.walk`](https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.walk#concurrency) repository.

#### cwd

  * Type: `string`
  * Default: `process.cwd()`

The current working directory in which to search.

#### deep

  * Type: `number|boolean`
  * Default: `true`

The deep option can be set to `true` to traverse the entire directory structure, or it can be set to a *number* to only traverse that many levels deep. The countdown begins with `1`.

For example, you have the following tree:

```js
dir/
└── one/            // 1
    └── two/        // 2
        └── file.js // 3
```

> :book: If you specify a pattern with some base directory, this directory will not participate in the calculation of the depth of the found directories. Think of it as a `cwd` option.

```js
fg('dir/**', { onlyFiles: false, deep: 1 });
// -> ['dir/one']
fg('dir/**', { onlyFiles: false, deep: 2 });
// -> ['dir/one', 'dir/one/two']

fg('**', { onlyFiles: false, cwd: 'dir', deep: 1 });
// -> ['one']
fg('**', { onlyFiles: false, cwd: 'dir', deep: 2 });
// -> ['one', 'one/two']
```

#### ignore

  * Type: `string[]`
  * Default: `[]`

An array of glob patterns to exclude matches.

#### dot

  * Type: `boolean`
  * Default: `false`

Allow patterns to match filenames starting with a period (files & directories), even if the pattern does not explicitly have a period in that spot.

#### stats

  * Type: `boolean`
  * Default: `false`

Return `fs.Stats` with two additional `path` and `depth` properties instead of a `string`.

#### onlyFiles

  * Type: `boolean`
  * Default: `true`

Return only files.

#### onlyDirectories

  * Type: `boolean`
  * Default: `false`

Return only directories.

#### followSymbolicLinks

  * Type: `boolean`
  * Default: `true`

Indicates whether to traverse descendants of symbolic link directories.

> :book: Also, if the `stats` option is specified, it tries to get `fs.Stats` for symbolic link file.

#### throwErrorOnBrokenSymbolicLink

  * Type: `boolean`
  * Default: `true`

Throw an error when symbolic link is broken if `true` or safely return `lstat` call if `false`. Always `false` when the `stats` option is disabled.

> :book: This option has no effect on errors when reading the symbolic link directory.

#### unique

  * Type: `boolean`
  * Default: `true`

Prevent duplicate results.

#### markDirectories

  * Type: `boolean`
  * Default: `false`

Add a `/` character to directory entries.

#### absolute

  * Type: `boolean`
  * Default: `false`

Return absolute paths for matched entries.

> :book: Note that you need to use this option if you want to use absolute negative patterns like `${__dirname}/*.md`.

#### braceExpansion

  * Type: `boolean`
  * Default: `true`

Enable expansion of brace patterns.

#### globstar

  * Type: `boolean`
  * Default: `true`

Enable matching with globstars (`**`).

#### extglob

  * Type: `boolean`
  * Default: `true`

Enable extglob support, so that extglobs are regarded as literal characters.

#### caseSensitiveMatch

  * Type: `boolean`
  * Default: `true`

Enable a [case-sensitive](https://en.wikipedia.org/wiki/Case_sensitivity) mode for matching files.

##### Examples

* File System: `test/file.md`, `test/File.md`
* Case-sensitive for `test/file.*` pattern: `test/file.md`
* Case-insensitive for `test/file.*` pattern: `test/file.md`, `test/File.md`

#### matchBase

  * Type: `boolean`
  * Default: `false`

Allow glob patterns without slashes to match a file path based on its basename. For example, `a?b` would match the path `/xyz/123/acb`, but not `/xyz/acb/123`.

#### suppressErrors

  * Type: `boolean`
  * Default: `false`

Suppress any errors from reader. Works only with Node.js 10.10+.
Can be useful when the directory has entries with a special level of access.

#### fs

* Type: `FileSystemAdapter`
* Default: `fs.*`

Custom implementation of methods for working with the file system.

```ts
interface FileSystemAdapter {
    lstat: typeof fs.lstat;
    stat: typeof fs.stat;
    lstatSync: typeof fs.lstatSync;
    statSync: typeof fs.statSync;
    readdir: typeof fs.readdir;
    readdirSync: typeof fs.readdirSync;
}
```

## How to exclude directory from reading?

You can use a negative pattern like this: `!**/node_modules` or `!**/node_modules/**`. Also you can use `ignore` option. Just look at the example below.

```
first/
├── file.md
└── second
    └── file.txt
```

If you don't want to read the `second` directory, you must write the following pattern: `!**/second` or `!**/second/**`.

```js
fg.sync(['**/*.md', '!**/second']); // ['first/file.md']
fg.sync(['**/*.md'], { ignore: ['**/second/**'] }); // ['first/file.md']
```

> :warning: When you write `!**/second/**/*` it means that the directory will be **read**, but all the entries will not be included in the results.

You have to understand that if you write the pattern to exclude directories, then the directory will not be read under any circumstances.

## Why are parentheses match wrong?

```js
fg.sync(['(special-*file).txt']) // → [] for files: ['(special-*file).txt']
```

Refers to Bash. You need to escape special characters:

```js
fg.sync(['\\(special-*file\\).txt']) // → ['(special-*file).txt']
```

Read more about [«Matching special characters as literals»](https://github.com/micromatch/picomatch#matching-special-characters-as-literals).

## How to write patterns on Windows?

Always use forward-slashes in glob expressions (patterns and `ignore` option). Use backslashes for escaping characters. With the `cwd` option use a convenient format.

**Bad**

```ts
[
	'directory\\*',
	path.join(process.cwd(), '**')
]
```

**Good**

```ts
[
	'directory/*',
	path.join(process.cwd(), '**').replace(/\\/g, '/')
]
```

> :book: Use the [`normalize-path`](https://www.npmjs.com/package/normalize-path) or the [`unixify`](https://www.npmjs.com/package/unixify) package to convert Windows-style path to a Unix-style path.

Read more about [matching with backslashes](https://github.com/micromatch/micromatch#backslashes).

## How to use UNC path?

You cannot use UNC paths as patterns (due to syntax), but you can use them as `cwd` directory.

```ts
fg.sync('*', { cwd: '\\\\?\\C:\\Python27' /* or //?/C:/Python27 */ });
fg.sync('Python27/*', { cwd: '\\\\?\\C:\\' /* or //?/C:/ */ });
```

## Compatible with `node-glob`?

Not fully, because `fast-glob` does not implement all options of `node-glob`. See table below.

| node-glob    | fast-glob |
| :----------: | :-------: |
| `cwd`        | [`cwd`](#cwd) |
| `root`       | – |
| `dot`        | [`dot`](#dot) |
| `nomount`    | – |
| `mark`       | [`markDirectories`](#markdirectories) |
| `nosort`     | – |
| `nounique`   | [`unique`](#unique) |
| `nobrace`    | [`braceExpansion`](#braceExpansion) |
| `noglobstar` | [`globstar`](#globstar) |
| `noext`      | [`extglob`](#extglob) |
| `nocase`     | [`caseSensitiveMatch`](#caseSensitiveMatch) |
| `matchBase`  | [`matchbase`](#matchbase) |
| `nodir`      | [`onlyFiles`](#onlyfiles) |
| `ignore`     | [`ignore`](#ignore) |
| `follow`     | [`followSymbolicLinks`](#followSymbolicLinks) |
| `realpath`   | – |
| `absolute`   | [`absolute`](#absolute) |

## Benchmarks

**Tech specs:**

Server: [Vultr Bare Metal](https://www.vultr.com/pricing/baremetal)

  * Processor: E3-1270v6 (8 CPU)
  * RAM: 32GB
  * Disk: SSD

You can see results [here](https://gist.github.com/mrmlnc/f06246b197f53c356895fa35355a367c) for latest release.

## Related

  * [readdir-enhanced](https://github.com/BigstickCarpet/readdir-enhanced) – Fast functional replacement for `fs.readdir()`.
  * [globby](https://github.com/sindresorhus/globby) – User-friendly glob matching.
  * [node-glob](https://github.com/isaacs/node-glob) – «Standard» glob functionality for Node.js
  * [bash-glob](https://github.com/micromatch/bash-glob) – Bash-powered globbing for node.js.
  * [glob-stream](https://github.com/gulpjs/glob-stream) – A Readable Stream interface over node-glob that used in the [gulpjs](https://github.com/gulpjs/gulp).
  * [tiny-glob](https://github.com/terkelg/tiny-glob) – Tiny and extremely fast library to match files and folders using glob patterns.

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/fast-glob/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
