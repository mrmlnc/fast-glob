import * as assert from "node:assert";
import * as path from "node:path";

import { glob, globSync } from "../index";

function normalizePaths(entries: readonly string[]): string[] {
  return entries.map((p) => p.split(path.sep).join("/")).sort();
}

describe("Quoted segments", () => {
  const cwd = path.join(process.cwd(), "fixtures", "__venus__", "quoted-segments");

  const cases = [
    {
      quoted: "foo/'bar'/baz.txt",
      unquoted: "foo/bar/baz.txt",
      expected: ["foo/bar/baz.txt"],
    },
    {
      quoted: 'foo/"bar"/baz.txt',
      unquoted: "foo/bar/baz.txt",
      expected: ["foo/bar/baz.txt"],
    },
    {
      quoted: "foo/'bar'/baz.*",
      unquoted: "foo/bar/baz.*",
      expected: ["foo/bar/baz.txt"],
    },
    {
      quoted: "foo/'bar'/*.txt",
      unquoted: "foo/bar/*.txt",
      expected: ["foo/bar/baz.txt", "foo/bar/qux.txt"],
    },
  ] as const;

  for (const testCase of cases) {
    it(`should treat ${testCase.quoted} same as ${testCase.unquoted} (async)`, async () => {
      const quotedMatches = await glob(testCase.quoted, { cwd, onlyFiles: true });
      const unquotedMatches = await glob(testCase.unquoted, { cwd, onlyFiles: true });

      assert.deepStrictEqual(normalizePaths(quotedMatches), normalizePaths(testCase.expected));
      assert.deepStrictEqual(normalizePaths(unquotedMatches), normalizePaths(testCase.expected));
      assert.deepStrictEqual(normalizePaths(quotedMatches), normalizePaths(unquotedMatches));
    });

    it(`should treat ${testCase.quoted} same as ${testCase.unquoted} (sync)`, () => {
      const quotedMatches = globSync(testCase.quoted, { cwd, onlyFiles: true });
      const unquotedMatches = globSync(testCase.unquoted, { cwd, onlyFiles: true });

      assert.deepStrictEqual(normalizePaths(quotedMatches), normalizePaths(testCase.expected));
      assert.deepStrictEqual(normalizePaths(unquotedMatches), normalizePaths(testCase.expected));
      assert.deepStrictEqual(normalizePaths(quotedMatches), normalizePaths(unquotedMatches));
    });
  }
});
