# fast-glob

> Is a faster (1.5-8x for most cases) `node-glob` alternative.

## Install

```
$ npm i -S fast-glob
```

## Why?

  * Fast by using Streams, Promises and Bash Globbing on Linux machines. Used [readdir-enhanced](https://github.com/BigstickCarpet/readdir-enhanced), [micromatch](https://github.com/jonschlinkert/micromatch) and [bash-glob](https://github.com/jonschlinkert/bash-glob).
  * You can limit the depth of your search (only for non-Bash mode).
  * You can get not only file paths, but also their `fs.Stats` objects with the additional `path` property.
  * You can transform file path or `fs.Stats` object before sending it to an array.

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

 * Intel Core i7-3610QM
 * RAM 8GB
 * SSD (555MB/S, 530MB/S)
 * Windows 10 + VirtualBox with Manjaro
 * Node.js v7.3.0

```shell
$ npm run bench

==============================
Benchmark for 10 files
==============================

bash: 6 ms
node-glob (10): 19.47606 ms
bash-glob (10): 23.406374 ms
fast-glob (10) as native: 25.359293 ms
fast-glob (10) as fast: 33.696387 ms

==============================
Benchmark for 50 files
==============================

bash: 6 ms
node-glob (54): 28.43855 ms
bash-glob (54): 20.731202 ms
fast-glob (54) as native: 22.709236 ms
fast-glob (54) as fast: 25.057461 ms

==============================
Benchmark for 100 files
==============================

bash: 5 ms
node-glob (109): 34.811618 ms
bash-glob (109): 21.624256 ms
fast-glob (109) as native: 26.291311 ms
fast-glob (109) as fast: 29.61791 ms

==============================
Benchmark for 500 files
==============================

bash: 7 ms
node-glob (549): 90.513766 ms
bash-glob (549): 23.116938 ms
fast-glob (549) as native: 30.978642 ms
fast-glob (549) as fast: 61.367613 ms

==============================
Benchmark for 1000 files
==============================

bash: 11 ms
node-glob (1099): 139.44816 ms
bash-glob (1099): 35.691985 ms
fast-glob (1099) as native: 36.770455 ms
fast-glob (1099) as fast: 84.387065 ms

==============================
Benchmark for 5000 files
==============================

bash: 43 ms
node-glob (5499): 584.910373 ms
bash-glob (5499): 90.38803 ms
fast-glob (5499) as native: 97.143759 ms
fast-glob (5499) as fast: 233.977073 ms

==============================
Benchmark for 10000 files
==============================

bash: 96 ms
node-glob (10999): 1143.377267 ms
bash-glob (10999): 169.416486 ms
fast-glob (10999) as native: 198.930152 ms
fast-glob (10999) as fast: 531.693878 ms
```

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/fast-glob/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
