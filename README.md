# fast-glob

> Is a faster (1.5-8x for most cases) `node-glob` alternative.

## Install

```
$ npm i -S fast-glob
```

## Why?

  * Fast by using Streams, Promises and Bash Globbing on Linux machines. Used [readdir-enhanced](https://github.com/BigstickCarpet/readdir-enhanced), [micromatch](https://github.com/jonschlinkert/micromatch) and [bash-glob](https://github.com/jonschlinkert/bash-glob).
  * You can limit the depth of your search.
  * You can get not only file paths, but also their `fs.Stats` objects with the additional `path` property.
  * You can transform file path or `fs.Stats` object before sending it to an array (only for async).

## Usage

```js
const fastGlob = require('fast-glob');

// Async
fastGlob('dir/**/*.txt').then((files) => {
  console.log(files); // ['dir/a.txt', ...]
});

// Sync
const files = fastGlob.sync('dir/**/*.txt');
console.log(files); // ['dir/a.txt', ...]
```

## API

### fastGlob(patterns, [options])

  * patterns `String|String[]` Patterns to be matched
  * options `Object`
  * return `String[]` or `fs.Stats[]` with `path` property

### fastGlob.sync(patterns, [options]) => []

  * patterns `String|String[]` Patterns to be matched
  * options `Object`
  * return `String[]` or `fs.Stats[]` with `path` property

## options

| Option      | Type              | Default                | Description |
|:------------:|:-----------------:|:---------------------:|:------------|
| `cwd`        | `String`          | `process.cwd`         | The current working directory in which to search |
| `deep`       | `Number|Boolean`  | `true`                | The deep option can be set to true to traverse the entire directory structure, or it can be set to a number to only traverse that many levels deep. |
| `ignore`     | `String|String[]` | `[]`                  | Add a pattern or an array of glob patterns to exclude matches. |
| `stats`      | `Boolean`         | `false`               | Return `fs.Stats` with `path` property instead of file path. |
| `onlyFiles`  | `Boolean`         | `false`               | Return only files. |
| `onlyDirs`   | `Boolean`         | `false`               | Return only directories. |
| `bashNative` | `String[]`        | `['darwin', 'linux']` | Use bash-powered globbing (2-15x faster on Linux, but slow on BashOnWindows) for specified platforms. See [available values for array](https://nodejs.org/dist/latest-v7.x/docs/api/process.html#process_process_platform). |
| `transform`  | `Function`        | `null`                | Allows you to transform a path or `fs.Stats` object before sending to the array. |

## Compatible with `node-glob`?

Not fully, because `fast-glob` not implements all options.

## Example for `transform` option

```js
fastGlob('dir/**/*.txt', { transform: readFilePromise }).then((files) => {
  console.log(files); // ['dir/a.txt', ...]
  return Promise.all(files);
}).then((files) => {
  console.log(files); // ['content from dir/a.txt', ...]
});
```

## Benchmark

**Tech specs:**

 * Intel Core i7-3610QM
 * RAM 8GB
 * SSD (555MB/S, 530MB/S)
 * Windows 10 + VirtualBox with Manjaro
 * Node.js v7.3.0

```
$ npm run bench

==============================
Benchmark for 10 files
==============================

bash: 7 ms
node-glob: 23.306994 ms
bash-glob: 41.611697 ms
fast-glob: 39.087715 ms

==============================
Benchmark for 50 files
==============================

bash: 8 ms
node-glob: 32.164124 ms
bash-glob: 28.615256 ms
fast-glob: 31.96207 ms

==============================
Benchmark for 100 files
==============================

bash: 19 ms
node-glob: 39.067372 ms
bash-glob: 25.896008 ms
fast-glob: 32.079583 ms

==============================
Benchmark for 500 files
==============================

bash: 8 ms
node-glob: 92.279699 ms
bash-glob: 25.536535 ms
fast-glob: 34.100112 ms

==============================
Benchmark for 1000 files
==============================

bash: 12 ms
node-glob: 156.300739 ms
bash-glob: 34.344514 ms
fast-glob: 62.152561 ms

==============================
Benchmark for 5000 files
==============================

bash: 50 ms
node-glob: 851.078399 ms
bash-glob: 97.357015 ms
fast-glob: 108.100992 ms

==============================
Benchmark for 10000 files
==============================

bash: 94 ms
node-glob: 1290.475356 ms
bash-glob: 177.635399 ms
fast-glob: 198.216185 ms
```

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/fast-glob/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
