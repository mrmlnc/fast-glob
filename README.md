# fast-glob

> Is a faster (1.5-3x for most cases) `node-glob` alternative.

## Install

```
$ npm i -S fast-glob
```

## Why?

  * Fast by using Streams and Promises. Used [readdir-enhanced](https://github.com/BigstickCarpet/readdir-enhanced) and [micromatch](https://github.com/jonschlinkert/micromatch).
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
| `bashNative` | `String[]`        | `['darwin', 'linux']` | Use bash-powered globbing (2-15x faster on Linux, but slow on BashOnWindows). See [available values for array](https://nodejs.org/dist/latest-v7.x/docs/api/process.html#process_process_platform). |
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
 * Windows 10 + Bash on Windows
 * Node.js v7.3.0

```
$ npm run bench

==============================
Benchmark for 10 files
==============================

bash: 29 ms
node-glob: 24.792 ms
bash-glob: 49.349 ms
fast-glob: 30.634 ms

==============================
Benchmark for 50 files
==============================

bash: 29 ms
node-glob: 47.785 ms
bash-glob: 53.233 ms
fast-glob: 41.686 ms

==============================
Benchmark for 100 files
==============================

bash: 37 ms
node-glob: 47.249 ms
bash-glob: 52.078 ms
fast-glob: 42.744 ms

==============================
Benchmark for 500 files
==============================

bash: 96 ms
node-glob: 101.044 ms
bash-glob: 71.519 ms
fast-glob: 63.216 ms

==============================
Benchmark for 1000 files
==============================

bash: 175 ms
node-glob: 163.652 ms
bash-glob: 105.412 ms
fast-glob: 79.491 ms

==============================
Benchmark for 5000 files
==============================

bash: 504 ms
node-glob: 680.071 ms
bash-glob: 339.901 ms
fast-glob: 204.793 ms

==============================
Benchmark for 10000 files
==============================

bash: 1591 ms
node-glob: 1300.15 ms
bash-glob: 1246.701 ms
fast-glob: 365.214 ms
```

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/fast-glob/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
