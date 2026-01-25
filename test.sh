#!/usr/bin/env bash
set -euo pipefail

mode="${1:-}"

if [[ "$mode" != "base" && "$mode" != "new" ]]; then
  echo "Usage: ./test.sh base|new"
  exit 1
fi

if [[ ! -d "out" ]]; then
  echo "ERROR: out/ folder not found. Compile once using: npm run compile"
  exit 2
fi

if [[ "$mode" == "base" ]]; then
  echo "Running base tests..."
  node_modules/.bin/mocha "out/**/*.spec.js" -s 0 --ignore "out/tests/quoted-segments.spec.js"
  exit 0
fi

echo "Running new tests..."
node_modules/.bin/mocha "out/tests/quoted-segments.spec.js" -s 0
