exports['Options Absolute {"pattern":"fixtures/*","options":{"absolute":true}} (sync) 1'] = [
  "<root>/fixtures/file.md"
]

exports['Options Absolute {"pattern":"fixtures/*","options":{"absolute":true}} (async) 1'] = [
  "<root>/fixtures/file.md"
]

exports['Options Absolute {"pattern":"fixtures/*","options":{"absolute":true}} (stream) 1'] = [
  "<root>/fixtures/file.md"
]

exports['Options Absolute {"pattern":"fixtures/**","options":{"absolute":true}} (sync) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute {"pattern":"fixtures/**","options":{"absolute":true}} (async) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute {"pattern":"fixtures/**","options":{"absolute":true}} (stream) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute {"pattern":"fixtures/**/*","options":{"absolute":true}} (sync) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute {"pattern":"fixtures/**/*","options":{"absolute":true}} (async) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute {"pattern":"fixtures/**/*","options":{"absolute":true}} (stream) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute {"pattern":"fixtures/../*","options":{"absolute":true}} (sync) 1'] = [
  "<root>/LICENSE",
  "<root>/package.json",
  "<root>/README.md",
  "<root>/tsconfig.json"
]

exports['Options Absolute {"pattern":"fixtures/../*","options":{"absolute":true}} (async) 1'] = [
  "<root>/LICENSE",
  "<root>/package.json",
  "<root>/README.md",
  "<root>/tsconfig.json"
]

exports['Options Absolute {"pattern":"fixtures/../*","options":{"absolute":true}} (stream) 1'] = [
  "<root>/LICENSE",
  "<root>/package.json",
  "<root>/README.md",
  "<root>/tsconfig.json"
]

exports['Options Absolute (ignore) {"pattern":"fixtures/*/*","options":{"ignore":["fixtures/*/nested"],"absolute":true}} (sync) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (ignore) {"pattern":"fixtures/*/*","options":{"ignore":["fixtures/*/nested"],"absolute":true}} (async) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (ignore) {"pattern":"fixtures/*/*","options":{"ignore":["fixtures/*/nested"],"absolute":true}} (stream) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (ignore) {"pattern":"fixtures/*/*","options":{"ignore":["**/nested"],"absolute":true}} (sync) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (ignore) {"pattern":"fixtures/*/*","options":{"ignore":["**/nested"],"absolute":true}} (async) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (ignore) {"pattern":"fixtures/*/*","options":{"ignore":["**/nested"],"absolute":true}} (stream) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (ignore) {"pattern":"fixtures/*","options":{"ignore":["<root>/fixtures/*"],"absolute":true}} (sync) 1'] = []

exports['Options Absolute (ignore) {"pattern":"fixtures/*","options":{"ignore":["<root>/fixtures/*"],"absolute":true}} (async) 1'] = []

exports['Options Absolute (ignore) {"pattern":"fixtures/*","options":{"ignore":["<root>/fixtures/*"],"absolute":true}} (stream) 1'] = []

exports['Options Absolute (ignore) {"pattern":"fixtures/**","options":{"ignore":["<root>/fixtures/*"],"absolute":true}} (sync) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (ignore) {"pattern":"fixtures/**","options":{"ignore":["<root>/fixtures/*"],"absolute":true}} (async) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (ignore) {"pattern":"fixtures/**","options":{"ignore":["<root>/fixtures/*"],"absolute":true}} (stream) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (cwd) {"pattern":"*","options":{"cwd":"fixtures","absolute":true}} (sync) 1'] = [
  "<root>/fixtures/file.md"
]

exports['Options Absolute (cwd) {"pattern":"*","options":{"cwd":"fixtures","absolute":true}} (async) 1'] = [
  "<root>/fixtures/file.md"
]

exports['Options Absolute (cwd) {"pattern":"*","options":{"cwd":"fixtures","absolute":true}} (stream) 1'] = [
  "<root>/fixtures/file.md"
]

exports['Options Absolute (cwd) {"pattern":"**","options":{"cwd":"fixtures","absolute":true}} (sync) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (cwd) {"pattern":"**","options":{"cwd":"fixtures","absolute":true}} (async) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (cwd) {"pattern":"**","options":{"cwd":"fixtures","absolute":true}} (stream) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (cwd) {"pattern":"**/*","options":{"cwd":"fixtures","absolute":true}} (sync) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (cwd) {"pattern":"**/*","options":{"cwd":"fixtures","absolute":true}} (async) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (cwd) {"pattern":"**/*","options":{"cwd":"fixtures","absolute":true}} (stream) 1'] = [
  "<root>/fixtures/file.md",
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (cwd & ignore) {"pattern":"*/*","options":{"ignore":["*/nested"],"cwd":"fixtures","absolute":true}} (sync) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (cwd & ignore) {"pattern":"*/*","options":{"ignore":["*/nested"],"cwd":"fixtures","absolute":true}} (async) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (cwd & ignore) {"pattern":"*/*","options":{"ignore":["*/nested"],"cwd":"fixtures","absolute":true}} (stream) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (cwd & ignore) {"pattern":"*/*","options":{"ignore":["**/nested"],"cwd":"fixtures","absolute":true}} (sync) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (cwd & ignore) {"pattern":"*/*","options":{"ignore":["**/nested"],"cwd":"fixtures","absolute":true}} (async) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (cwd & ignore) {"pattern":"*/*","options":{"ignore":["**/nested"],"cwd":"fixtures","absolute":true}} (stream) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/second/file.md"
]

exports['Options Absolute (cwd & ignore) {"pattern":"*","options":{"ignore":["<root>/fixtures/*"],"cwd":"fixtures","absolute":true}} (sync) 1'] = []

exports['Options Absolute (cwd & ignore) {"pattern":"*","options":{"ignore":["<root>/fixtures/*"],"cwd":"fixtures","absolute":true}} (async) 1'] = []

exports['Options Absolute (cwd & ignore) {"pattern":"*","options":{"ignore":["<root>/fixtures/*"],"cwd":"fixtures","absolute":true}} (stream) 1'] = []

exports['Options Absolute (cwd & ignore) {"pattern":"**","options":{"ignore":["<root>/fixtures/*"],"cwd":"fixtures","absolute":true}} (sync) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (cwd & ignore) {"pattern":"**","options":{"ignore":["<root>/fixtures/*"],"cwd":"fixtures","absolute":true}} (async) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (cwd & ignore) {"pattern":"**","options":{"ignore":["<root>/fixtures/*"],"cwd":"fixtures","absolute":true}} (stream) 1'] = [
  "<root>/fixtures/first/file.md",
  "<root>/fixtures/first/nested/directory/file.json",
  "<root>/fixtures/first/nested/directory/file.md",
  "<root>/fixtures/first/nested/file.md",
  "<root>/fixtures/second/file.md",
  "<root>/fixtures/second/nested/directory/file.md",
  "<root>/fixtures/second/nested/file.md",
  "<root>/fixtures/third/library/a/book.md",
  "<root>/fixtures/third/library/b/book.md"
]

exports['Options Absolute (cwd & ignore) {"pattern":"**","options":{"ignore":["<root>/fixtures/**"],"cwd":"fixtures","absolute":true}} (sync) 1'] = []

exports['Options Absolute (cwd & ignore) {"pattern":"**","options":{"ignore":["<root>/fixtures/**"],"cwd":"fixtures","absolute":true}} (async) 1'] = []

exports['Options Absolute (cwd & ignore) {"pattern":"**","options":{"ignore":["<root>/fixtures/**"],"cwd":"fixtures","absolute":true}} (stream) 1'] = []
