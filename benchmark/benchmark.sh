#!/bin/bash

pwd=$PWD
tmp=${TMPDIR:-/tmp}
fixtures=$tmp/fast-glob-benchmark-fixtures

function get_current_time_in_ns {
	if [[ "$OSTYPE" == "darwin"* ]]; then
		echo $(gdate +%s%N)
	else
		echo $(date +%s%N)
	fi
}

bash benchmark/fixtures.sh

# Run benchmark for pattern
#
# $1 - directory
function benchmark {
	echo
	echo ==============================
	echo Benchmark for $1 files
	echo ==============================
	cd $fixtures/$1

	echo
	echo Bash timing:
	start=$(get_current_time_in_ns)
	bash -c "shopt -s globstar; echo **/* | wc -w"
	end=$(get_current_time_in_ns)
	runtime=$(((end - start) / 1000000))
	files=$(shopt -s globstar; echo **/* | wc -w)
	echo bash "($files)": $runtime ms

	node $pwd/benchmark/glob.js
	node $pwd/benchmark/fast.js
}

benchmark 10
benchmark 50
benchmark 100
benchmark 500
benchmark 1000
benchmark 5000
benchmark 10000

# Remove temporary files
rm -rf $fixtures
