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

| Option      | Type              | Default       | Description |
|:-----------:|:-----------------:|:-------------:|:------------|
| `cwd`       | `String`          | `process.cwd` | The current working directory in which to search |
| `deep`      | `Number|Boolean`  | `true`        | The deep option can be set to true to traverse the entire directory structure, or it can be set to a number to only traverse that many levels deep. |
| `ignore`    | `String|String[]` | `[]`          | Add a pattern or an array of glob patterns to exclude matches. |
| `stats`     | `Boolean`         | `false`       | Return `fs.Stats` with `path` property instead of file path. |
| `onlyFiles` | `Boolean`         | `false`       | Return only files. |
| `onlyDirs`  | `Boolean`         | `false`       | Return only directories. |
| `transform` | `Function`        | `null`        | Allows you to transform a path or `fs.Stats` object before sending to the array. |

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

```
$ npm run bench

==============================
Benchmark for 10 files
==============================

bash: 28 ms
node-glob: 22.456 ms
fast-glob: 27.127 ms

==============================
Benchmark for 50 files
==============================

bash: 25 ms
node-glob: 59.607 ms
fast-glob: 37.128 ms

==============================
Benchmark for 100 files
==============================

bash: 32 ms
node-glob: 44.644 ms
fast-glob: 41.049 ms

==============================
Benchmark for 500 files
==============================

bash: 87 ms
node-glob: 85.773 ms
fast-glob: 61.341 ms

==============================
Benchmark for 1000 files
==============================

bash: 150 ms
node-glob: 148.039 ms
fast-glob: 79.496 ms

==============================
Benchmark for 5000 files
==============================

bash: 443 ms
node-glob: 517.611 ms
fast-glob: 191.614 ms

==============================
Benchmark for 10000 files
==============================

bash: 1611 ms
node-glob: 1027.499 ms
fast-glob: 310.679 ms
```

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/fast-glob/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
