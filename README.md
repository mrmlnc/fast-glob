# fast-glob

> Is a faster (1.5-8x for most cases) `node-glob` alternative.

## Donate

If you want to thank me, or promote your Issue.

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/mrmlnc)

> Sorry, but I have work and support for packages requires some time after work. I will be glad of your support and PR's.

## Install

```
$ npm i -S fast-glob
```

## Why?

  * Fast by using Streams and Promises. Used [readdir-enhanced](https://github.com/BigstickCarpet/readdir-enhanced) and [micromatch](https://github.com/jonschlinkert/micromatch).
  * You can limit the depth of your search.
  * You can get not only file paths, but also their `fs.Stats` objects with the additional `path` property.
  * You can transform file path or `fs.Stats` object before sending it to an array of results.

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
| `deep`       | `Number\|Boolean`  | `true`                | The deep option can be set to true to traverse the entire directory structure, or it can be set to a number to only traverse that many levels deep. |
| `ignore`     | `String\|String[]` | `[]`                  | Add a pattern or an array of glob patterns to exclude matches. |
| `stats`      | `Boolean`         | `false`               | Return `fs.Stats` with `path` property instead of file path. |
| `onlyFiles`  | `Boolean`         | `false`               | Return only files. |
| `onlyDirs`   | `Boolean`         | `false`               | Return only directories. |
| `transform`  | `Function`        | `null`                | Allows you to transform a path or `fs.Stats` object before sending to the array. |

## Compatible with `node-glob`?

Not fully, because `fast-glob` not implements all options of `node-glob`.

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

  * MacBook Pro (Retina, 13-inch, Early 2015)
    * Intel Core i5
    * RAM 16GB
    * Node.js v9.3.0

```shell
$ npm run bench

==============================
Benchmark for 10 files
==============================

bash (     10): 16 ms
node-glob (10): 6.149452 ms
fast-glob (10): 16.535819 ms

==============================
Benchmark for 50 files
==============================

bash (     54): 13 ms
node-glob (54): 14.236377 ms
fast-glob (54): 20.976846 ms

==============================
Benchmark for 100 files
==============================

bash (     109): 12 ms
node-glob (109): 23.248501 ms
fast-glob (109): 18.061438 ms

==============================
Benchmark for 500 files
==============================

bash (     549): 21 ms
node-glob (549): 63.018853 ms
fast-glob (549): 33.51311 ms

==============================
Benchmark for 1000 files
==============================

bash (     1099): 22 ms
node-glob (1099): 117.887727 ms
fast-glob (1099): 53.68764 ms

==============================
Benchmark for 5000 files
==============================

bash (     5499): 62 ms
node-glob (5499): 541.683609 ms
fast-glob (5499): 195.488406 ms

==============================
Benchmark for 10000 files
==============================

bash (     10999): 118 ms
node-glob (10999): 1074.123839 ms
fast-glob (10999): 319.520454 ms
```

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/fast-glob/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
