exports['Options MatchBase {"pattern":"file.md","options":{"cwd":"fixtures","baseNameMatch":true}} (sync) 1'] = [
  "file.md",
  "first/file.md",
  "first/nested/directory/file.md",
  "first/nested/file.md",
  "second/file.md",
  "second/nested/directory/file.md",
  "second/nested/file.md"
]

exports['Options MatchBase {"pattern":"file.md","options":{"cwd":"fixtures","baseNameMatch":true}} (async) 1'] = [
  "file.md",
  "first/file.md",
  "first/nested/directory/file.md",
  "first/nested/file.md",
  "second/file.md",
  "second/nested/directory/file.md",
  "second/nested/file.md"
]

exports['Options MatchBase {"pattern":"file.md","options":{"cwd":"fixtures","baseNameMatch":true}} (stream) 1'] = [
  "file.md",
  "first/file.md",
  "first/nested/directory/file.md",
  "first/nested/file.md",
  "second/file.md",
  "second/nested/directory/file.md",
  "second/nested/file.md"
]

exports['Options MatchBase {"pattern":"first/*/file.md","options":{"cwd":"fixtures","baseNameMatch":true}} (sync) 1'] = [
  "first/nested/file.md"
]

exports['Options MatchBase {"pattern":"first/*/file.md","options":{"cwd":"fixtures","baseNameMatch":true}} (async) 1'] = [
  "first/nested/file.md"
]

exports['Options MatchBase {"pattern":"first/*/file.md","options":{"cwd":"fixtures","baseNameMatch":true}} (stream) 1'] = [
  "first/nested/file.md"
]

exports['Options MatchBase {"pattern":"first/**/file.md","options":{"cwd":"fixtures","baseNameMatch":true}} (sync) 1'] = [
  "first/file.md",
  "first/nested/directory/file.md",
  "first/nested/file.md"
]

exports['Options MatchBase {"pattern":"first/**/file.md","options":{"cwd":"fixtures","baseNameMatch":true}} (async) 1'] = [
  "first/file.md",
  "first/nested/directory/file.md",
  "first/nested/file.md"
]

exports['Options MatchBase {"pattern":"first/**/file.md","options":{"cwd":"fixtures","baseNameMatch":true}} (stream) 1'] = [
  "first/file.md",
  "first/nested/directory/file.md",
  "first/nested/file.md"
]
