# :rocket: fast-glob

> Is a faster [`node-glob`](https://github.com/isaacs/node-glob) alternative.

[![Build Status](https://travis-ci.org/mrmlnc/fast-glob.svg?branch=master)](https://travis-ci.org/mrmlnc/fast-glob)
[![Build status](https://ci.appveyor.com/api/projects/status/i4xqijtq26qf6o9d?svg=true)](https://ci.appveyor.com/project/mrmlnc/fast-glob)

## :bulb: Highlights

  * :rocket: Fast by using Streams and Promises. Used [readdir-enhanced](https://github.com/BigstickCarpet/readdir-enhanced) and [micromatch](https://github.com/jonschlinkert/micromatch).
  * :beginner: User-friendly by supports multiple and negated patterns (`['*', '!*.md']`).
  * :vertical_traffic_light: Rational, because it doesn't read excluded directories (`!**/node_modules`).
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

Returns a `Promise<Array>` of matching entries.

#### patterns

  * Type: `string|string[]`

#### options

  * Type: `Object`

See [options](https://github.com/mrmlnc/fast-glob#Options) section for more detailed information.

### fg.sync(patterns, [options])

Returns a `Array` of matching entries.

### fg.stream(patterns, [options])

Returns a [`ReadableStream`](https://nodejs.org/api/stream.html#stream_readable_streams).

## Options

#### cwd

  * Type: `string`
  * Default: `process.cwd()`

The current working directory in which to search.

#### deep

  * Type: `number|boolean`
  * Default: `true`

The deep option can be set to `true` to traverse the entire directory structure, or it can be set to a *number* to only traverse that many levels deep.

#### ignore

  * Type: `string[]`
  * Default: `[]`

An array of glob patterns to exclude matches.

#### dot

  * Type: `boolean`
  * Default: `false`

Allow patterns to match filenames starting with a period (files & directories), even if the pattern does not explicitly have a period in that spot.

#### stats

  * Type: `number|boolean`
  * Default: `false`

Return `fs.Stats` with `path` property instead of file path.

#### onlyFiles

  * Type: `boolean`
  * Default: `true`

Return only files.

#### onlyDirectories

  * Type: `boolean`
  * Default: `false`

Return only directories.

#### transform

  * Type: `Function`
  * Default: `null`

Allows you to transform a path or `fs.Stats` object before sending to the array.

```js
const fg = require('fast-glob');

const entries1 = fg.sync(['**/*.scss']);
const entries2 = fg.sync(['**/*.scss'], { transform: (entry) => '_' + entry });

console.log(entries1); // ['a.scss', 'b.scss']
console.log(entries2); // ['_a.scss', '_b.scss']
```

## How to exclude directory from reading?

You can use a negative pattern like this: `!**/node_modules`. Also you can use `ignore` option. Just look at the example below.

  * **first/**
    * **second/**
      * file.md
    * file.md

If you don't want to read the `second` directory, you must write the following pattern: `!**/second`.

```js
fg.sync(['**/*.md', '!**/second']); // ['first/file.txt']
fg.sync(['**/*.md'], { ignore: '**/second' }); // ['first/file.txt']
```

> :warning: When you write `!**/second/**` it means that the directory will be **read**, but all the entries will not be included in the results.

You have to understand that if you write the pattern to exclude directories, then the directory will not be read under any circumstances. But… you can specify a more meaningful pattern, which will be launched in parallel with the first.

```js
fg.sync(['**/*.txt', '!**/second', 'first/second/**/*.txt']); // ['first/file.txt', 'first/second/file.txt']
```

However, be aware that it may not work as you expect in case where inside the `second` directory there is a directory matching to the pattern for exluding directory. Yes, sounds complicated. Simpler: the `second` directory inside the `second` directory.

## Compatible with `node-glob`?

Not fully, because `fast-glob` not implements all options of `node-glob`.

## Benchmarks

**Tech specs:**

  * Processor: 2 ⅹ E5-2660 (32 core)
  * RAM: 64GB
  * Disk: RAMDisk

You can see results [here](https://gist.github.com/mrmlnc/f06246b197f53c356895fa35355a367c) for latest release.

## Related

  * [readdir-enhanced](https://github.com/BigstickCarpet/readdir-enhanced) – Fast functional replacement for `fs.readdir()`.
  * [globby](https://github.com/sindresorhus/globby) – User-friendly glob matching.
  * [node-glob](https://github.com/isaacs/node-glob) – «Standard» glob functionality for Node.js
  * [bash-glob](https://github.com/micromatch/bash-glob) – Bash-powered globbing for node.js.
  * [glob-stream](https://github.com/gulpjs/glob-stream) – A Readable Stream interface over node-glob that used in the [gulpjs](https://github.com/gulpjs/gulp).

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/fast-glob/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
